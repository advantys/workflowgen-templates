using Microsoft.AspNet.Identity;
using Microsoft.AspNet.Identity.Owin;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.HtmlControls;
using System.Web.UI.WebControls;

namespace WorkflowGenExample
{
    public partial class _Default : Page
    {
        private SiteMaster siteMaster;

        protected void Page_Load(object sender, EventArgs e)
        {
            siteMaster = Master as SiteMaster;
            siteMaster.ShowLoginButtonInNav = false;
        }

        protected void btnLogin_Click(object sender, EventArgs e)
            => siteMaster.btnLogin_Click(sender, e);
    }
}