using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Net.Http;
using System.Configuration;
using Microsoft.Owin;
using Microsoft.Owin.Security.OpenIdConnect;
using Microsoft.Owin.Security.Cookies;
using Owin;
using Microsoft.Owin.Security;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using IdentityModel.Client;
using System.Security.Claims;

[assembly: OwinStartup(typeof(WorkflowGenExample.App_Start.StartupAuth))]
namespace WorkflowGenExample.App_Start
{
    public class StartupAuth
    {
        private readonly string ClientId = ConfigurationManager.AppSettings["ClientId"];
        private readonly string ClientSecret = ConfigurationManager.AppSettings["ClientSecret"];
        private readonly string Authority = ConfigurationManager.AppSettings["Authority"];
        private readonly string Resource = ConfigurationManager.AppSettings["Resource"];
        private readonly string RedirectUri = ConfigurationManager.AppSettings["RedirectUri"];

        public void Configuration(IAppBuilder app)
        {
            app.SetDefaultSignInAsAuthenticationType(CookieAuthenticationDefaults.AuthenticationType);
            app.UseCookieAuthentication(new CookieAuthenticationOptions());
            app.UseOpenIdConnectAuthentication(new OpenIdConnectAuthenticationOptions
            {
                ClientId = ClientId,
                ClientSecret = ClientSecret,
                Authority = Authority,
                Resource = Resource,
                ResponseType = OpenIdConnectResponseType.CodeIdToken,
                Scope = $"{OpenIdConnectScope.OpenId} {OpenIdConnectScope.OpenIdProfile} {OpenIdConnectScope.Email}",
                TokenValidationParameters = new TokenValidationParameters
                {
                    NameClaimType = "name"
                },
                UseTokenLifetime = true,
                CallbackPath = new PathString("/signin"),
                Notifications = new OpenIdConnectAuthenticationNotifications
                {
                    AuthorizationCodeReceived = async notification =>
                    {
                        // TODO: Change for "using var client = ..." in C# 8.0
                        using (var client = new HttpClient())
                        {
                            var tokenResponse = await client.RequestAuthorizationCodeTokenAsync(new AuthorizationCodeTokenRequest
                            {
                                Address = $"{Authority}/oauth2/token",
                                ClientId = ClientId,
                                ClientSecret = ClientSecret,
                                RedirectUri = RedirectUri,
                                Code = notification.Code
                            });

                            if (tokenResponse.IsError)
                                throw new Exception(message: tokenResponse.Error);

                            notification.AuthenticationTicket.Identity.AddClaims(new List<Claim>
                            {
                                new Claim("id_token", tokenResponse.IdentityToken),
                                new Claim("access_token", tokenResponse.AccessToken)
                            });
                        }
                    }
                }
            });
        }
    }
}
