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
        private readonly IConfiguration config;

        public IndexModel(IConfiguration config)
            : base()
            => this.config = config;

        public async Task OnGetAsync()
        {
            (var idToken, var accessToken) = await Utilities.GetTokensFromContext(
                context: HttpContext,
                authority: config["OpenId:Authority"],
                clientId: config["OpenId:ClientId"],
                clientSecret: config["OpenId:ClientSecret"],
                resource: config["OpenId:Resource"]
            );

            ViewData["idToken"] = idToken;
            ViewData["accessToken"] = accessToken;
        }
    }
}
