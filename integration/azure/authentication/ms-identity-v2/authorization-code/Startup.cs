using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.HttpsPolicy;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using GraphQL.Client;
using GraphQL.Client.Http;

namespace WorkflowGenClientExample
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });
            services.AddAuthentication(options =>
            {
                options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
            })
            .AddCookie()
            .AddOpenIdConnect(OpenIdConnectDefaults.AuthenticationScheme, options =>
            {
                Configuration.Bind("OpenId", options);

                // We need the authorization code to get both id and access tokens
                options.ResponseType = OpenIdConnectResponseType.Code;
                options.UsePkce = false;

                // Saves the access token in the cookies
                options.SaveTokens = true;

                // Session lifetime will match the tokens'
                options.UseTokenLifetime = true;

                // WorkflowGen's GraphQL API doesn't have a /userinfo endpoint
                // like described in the OpenID Connect protocol. This prevents
                // the middleware from requesting from this endpoint.
                options.GetClaimsFromUserInfoEndpoint = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = "name",
                    RoleClaimType = "role"
                };

                // Adds an action to map custom claims from additional scopes.
                options.ClaimActions.MapUniqueJsonKey("sub", "sub");
                options.ClaimActions.MapUniqueJsonKey("name", "name");
                options.ClaimActions.MapUniqueJsonKey("given_name", "given_name");
                options.ClaimActions.MapUniqueJsonKey("family_name", "family_name");
                options.ClaimActions.MapUniqueJsonKey("profile", "profile");
                options.ClaimActions.MapUniqueJsonKey("email", "email");
                options.ClaimActions.MapUniqueJsonKey("oid", "oid");

                // Ensures that only the following scopes are requested.
                // If you need more, add them here.
                options.Scope.Clear();
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");
                options.Scope.Add($"{options.Resource}/default");

                options.Events = new OpenIdConnectEvents
                {
                    // Manually handles the exchange of the authorization code
                    // for tokens (id token and access token)
                    OnAuthorizationCodeReceived = async context =>
                    {
                        var request = context.HttpContext.Request;
                        var currentUri = UriHelper.BuildAbsolute(
                            scheme: request.Scheme,
                            host: request.Host,
                            pathBase: request.PathBase,
                            path: request.Path
                        );
                        var credential = new ClientCredential(options.ClientId, options.ClientSecret);
                        var authContext = new AuthenticationContext(
                            options.Authority,
                            tokenCache: AuthPropertiesTokenCache.ForCodeRedemption(context.Properties)
                        );
                        var result = await authContext.AcquireTokenByAuthorizationCodeAsync(
                            authorizationCode: context.ProtocolMessage.Code,
                            redirectUri: new Uri(currentUri),
                            credential,
                            resource: options.Resource
                        );

                        context.HandleCodeRedemption(result.AccessToken, result.IdToken);
                    }
                };
            });
            services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
            services.AddTransient<IGraphQLClient, GraphQLHttpClient>(provider =>
            {
                // Retrieve the access token from the TokenCache.
                var httpContextAccessor = provider.GetService<IHttpContextAccessor>();
                var client = new GraphQLHttpClient(Configuration["OpenId:Resource"]);
                (var _, var accessToken) = Utilities.GetTokensFromContext(
                    context: httpContextAccessor.HttpContext,
                    authority: Configuration["OpenId:Authority"],
                    clientId: Configuration["OpenId:ClientId"],
                    clientSecret: Configuration["OpenId:ClientSecret"],
                    resource: Configuration["OpenId:Resource"]
                ).Result;

                client.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");
                return client;
            });
            services.AddRazorPages();
            services.AddAuthorization(options =>
            {
                options.AddPolicy("RequireAuthenticated", policy => policy.RequireAuthenticatedUser());
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
                app.UseDeveloperExceptionPage();
            else
            {
                app.UseExceptionHandler("/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseRouting();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapRazorPages();
            });
        }
    }
}
