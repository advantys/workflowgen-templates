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
using Microsoft.IdentityModel.Tokens;
using Microsoft.IdentityModel.Clients.ActiveDirectory;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;

namespace oidc
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

                options.ResponseType = "code id_token";
                options.SaveTokens = true;
                options.UseTokenLifetime = true;
                options.GetClaimsFromUserInfoEndpoint = false;
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = "name",
                    RoleClaimType = "role"
                };

                // Prevents the handler from removing those claims from the id token.
                // Concretely, those lines removes the Action pending for this claim.
                options.ClaimActions.Remove("nonce");
                options.ClaimActions.Remove("aud");
                options.ClaimActions.Remove("azp");
                options.ClaimActions.Remove("acr");
                options.ClaimActions.Remove("amr");
                options.ClaimActions.Remove("iss");
                options.ClaimActions.Remove("iat");
                options.ClaimActions.Remove("nbf");
                options.ClaimActions.Remove("exp");
                options.ClaimActions.Remove("at_hash");
                options.ClaimActions.Remove("c_hash");
                options.ClaimActions.Remove("auth_time");
                options.ClaimActions.Remove("ipaddr");
                options.ClaimActions.Remove("platf");
                options.ClaimActions.Remove("ver");

                // Adds an action to map custom claims from additional scopes.
                options.ClaimActions.MapUniqueJsonKey("sub", "sub");
                options.ClaimActions.MapUniqueJsonKey("name", "name");
                options.ClaimActions.MapUniqueJsonKey("given_name", "given_name");
                options.ClaimActions.MapUniqueJsonKey("family_name", "family_name");
                options.ClaimActions.MapUniqueJsonKey("profile", "profile");
                options.ClaimActions.MapUniqueJsonKey("email", "email");

                // Ensures that only the following scopes are requested.
                options.Scope.Clear();
                options.Scope.Add("openid");
                options.Scope.Add("profile");
                options.Scope.Add("email");

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
                        var authContext = new AuthenticationContext(options.Authority, validateAuthority: true);
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
            services.AddMvc(options =>
            {
                var policy = new AuthorizationPolicyBuilder()
                    .RequireAuthenticatedUser()
                    .Build();
                options.Filters.Add(new AuthorizeFilter(policy));
            })
            .SetCompatibilityVersion(CompatibilityVersion.Version_2_2);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
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
            app.UseAuthentication();
            app.UseMvc();
        }
    }
}
