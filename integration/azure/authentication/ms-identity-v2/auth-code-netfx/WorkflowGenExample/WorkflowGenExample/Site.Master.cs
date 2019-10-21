using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using Microsoft.Owin.Security;
using Microsoft.Owin.Security.OpenIdConnect;
using System.Web.Security;
using Microsoft.Owin.Security.Cookies;

namespace WorkflowGenExample
{
    public partial class SiteMaster : MasterPage
    {
        public bool ShowLoginButtonInNav { get; set; } = true;

        protected void Page_Load(object sender, EventArgs e)
        {
        }

        public void btnLogin_Click(object sender, EventArgs e)
        {
            if (Request.IsAuthenticated)
                return;

            Context.GetOwinContext().Authentication.Challenge(
                properties: new AuthenticationProperties
                {
                    RedirectUri = "/"
                },
                authenticationTypes: OpenIdConnectAuthenticationDefaults.AuthenticationType
            );
        }

        public void btnLogout_Click(object sender, EventArgs e)
        {
            Context.GetOwinContext().Authentication.SignOut(authenticationTypes: CookieAuthenticationDefaults.AuthenticationType);
            Response.Redirect("/");
        }
    }
}