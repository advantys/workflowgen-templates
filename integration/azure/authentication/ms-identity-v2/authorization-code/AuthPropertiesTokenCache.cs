using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Clients.ActiveDirectory;

namespace WorkflowGenClientExample
{
    /// <summary>
    /// <see>https://github.com/aspnet/AspNetCore/blob/v2.2.3/src/Security/Authentication/OpenIdConnect/samples/OpenIdConnect.AzureAdSample/AuthPropertiesTokenCache.cs</see>
    /// </summary>
    public class AuthPropertiesTokenCache : TokenCache
    {
        private const string TOKEN_CACHE_KEY = ".TokenCache";

        private readonly HttpContext _httpContext;
        private readonly string _signInScheme;

        private ClaimsPrincipal _principal;
        private AuthenticationProperties _authProps;

        /// <summary>
        /// Builds a token cache with the given authentication properties.
        /// </summary>
        /// <param name="authProps">The authentication properties</param>
        /// <returns>The token cache associated with the authentication properties</returns>
        public static TokenCache ForCodeRedemption(AuthenticationProperties authProps)
            => new AuthPropertiesTokenCache(authProps);

        /// <summary>
        /// Builds the token cache associated with the http context in order
        /// to retreive access and id tokens.
        /// </summary>
        /// <param name="context">The current http context.</param>
        /// <param name="signInScheme">The signin scheme to use.</param>
        /// <returns>The token cache associated with the current http context.</returns>
        public static TokenCache ForApiCalls(
            HttpContext context,
            string signInScheme = CookieAuthenticationDefaults.AuthenticationScheme
        ) => new AuthPropertiesTokenCache(context, signInScheme);

        private AuthPropertiesTokenCache() : base()
            => BeforeWrite = BeforeWriteNotification;

        private AuthPropertiesTokenCache(AuthenticationProperties authProps)
            : this()
        {
            _authProps = authProps;
            BeforeAccess = BeforeAccessNotificationWithProperties;
            AfterAccess = AfterAccessNotificationWithProperties;
        }

        private AuthPropertiesTokenCache(HttpContext context, string signInScheme)
            : this()
        {
            _httpContext = context;
            _signInScheme = signInScheme;
            BeforeAccess = BeforeAccessNotificationWithContext;
            AfterAccess = AfterAccessNotificationWithContext;
        }

        private void BeforeAccessNotificationWithProperties(TokenCacheNotificationArgs args)
        {
            if (_authProps.Items.TryGetValue(TOKEN_CACHE_KEY, out var cachedTokensText))
                DeserializeAdalV3(Convert.FromBase64String(cachedTokensText));
        }

        private void BeforeAccessNotificationWithContext(TokenCacheNotificationArgs args)
        {
            var result = _httpContext.AuthenticateAsync(_signInScheme).Result;
            _authProps = result.Ticket.Properties;
            _principal = result.Ticket.Principal;

            BeforeAccessNotificationWithProperties(args);
        }

        private void AfterAccessNotificationWithProperties(TokenCacheNotificationArgs args)
        {
            if (HasStateChanged)
                _authProps.Items[TOKEN_CACHE_KEY] = Convert.ToBase64String(SerializeAdalV3());
        }

        private void AfterAccessNotificationWithContext(TokenCacheNotificationArgs args)
        {
            AfterAccessNotificationWithProperties(args);

            if (HasStateChanged)
                _httpContext.SignInAsync(_signInScheme, _principal, _authProps).Wait();
        }

        private void BeforeWriteNotification(TokenCacheNotificationArgs args)
        {
            // if you want to ensure that no concurrent write take place, use this notification to place a lock on the entry
        }
    }
}
