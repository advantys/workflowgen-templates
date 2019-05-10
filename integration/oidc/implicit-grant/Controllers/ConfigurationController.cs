using System;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Mvc;

namespace implicit_grant.Controllers
{
    [Route("api/[controller]")]
    public class ConfigurationController : Controller
    {
        private readonly IConfiguration config;

        public ConfigurationController(IConfiguration config)
        {
            this.config = config;
        }

        [HttpGet("[action]")]
        public Object Client()
            => new {
                client_id = config["Oidc:ClientId"],
                tenant_id = config["Oidc:TenantId"],
                redirect_uri = config["Oidc:RedirectUri"],
                resource = config["Oidc:Resource"]
            };
    }
}
