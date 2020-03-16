using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace WorkflowGenClientExample
{
    public partial class Utilities
    {
        private const string ObjectIdentifierClaimUri = "http://schemas.microsoft.com/identity/claims/objectidentifier";

        /// <summary>
        /// Get the stored tokens associated with the http context.
        /// </summary>
        /// <param name="context">The current http context.</param>
        /// <param name="authority">The authority of the OIDC configuration.</param>
        /// <param name="clientId">The OIDC client id of this application.</param>
        /// <param name="clientSecret">The OIDC client secret of this application.</param>
        /// <param name="resource">The OIDC resource identifier.</param>
        /// <returns>A tuple with the id and access tokens.</returns>
        public static async Task<(string idToken, string accessToken)> GetTokensFromContext(
            HttpContext context,
            string authority,
            string clientId,
            string clientSecret,
            string resource
        )
        {
            var authContext = new AuthenticationContext(authority, AuthPropertiesTokenCache.ForApiCalls(context, CookieAuthenticationDefaults.AuthenticationScheme));
            var credential = new ClientCredential(clientId, clientSecret);
            var userObjectId = context.User.FindFirst(ObjectIdentifierClaimUri).Value;
            var result = await authContext.AcquireTokenSilentAsync(
                resource: resource,
                clientCredential: credential,
                userId: new UserIdentifier(userObjectId, UserIdentifierType.UniqueId)
            );

            return (
                idToken: result.IdToken,
                accessToken: result.AccessToken
            );
        }
    }
}
