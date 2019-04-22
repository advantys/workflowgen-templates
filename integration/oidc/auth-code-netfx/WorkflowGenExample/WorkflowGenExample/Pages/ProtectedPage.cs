using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;

namespace WorkflowGenExample.Pages
{
    public abstract class ProtectedPage : Page
    {
        protected virtual void Page_Load(object sender, EventArgs e)
        {
            if (Request.IsAuthenticated)
                return;

            Response.StatusCode = (int)HttpStatusCode.NotFound;
            Server.Transfer("~/404.aspx");
        }
    }
}