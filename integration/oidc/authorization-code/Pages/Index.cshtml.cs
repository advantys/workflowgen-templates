using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;

namespace oidc.Pages
{
    public class IndexModel : PageModel
    {
        private readonly IConfiguration _config;

        public IndexModel(IConfiguration config)
            : base()
            => _config = config;

        public async Task OnGetAsync()
        {
            (
                string idToken,
                string accessToken
            ) = await Utilities.GetTokensFromContext(
                context: HttpContext,
                authority: _config["OpenId:Authority"],
                clientId: _config["OpenId:ClientId"],
                clientSecret: _config["OpenId:ClientSecret"],
                resource: _config["OpenId:Resource"]
            );

            ViewData["idToken"] = idToken;
            ViewData["accessToken"] = accessToken;
        }
    }
}
