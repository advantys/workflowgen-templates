using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.UI;
using GraphQL.Client.Http;
using GraphQL.Client;
using System.Configuration;
using System.Security.Claims;

namespace WorkflowGenExample.Pages
{
    public abstract class ProtectedPage : Page
    {
        protected IGraphQLClient GraphQLClient { get; private set; } = null;

        ~ProtectedPage() => GraphQLClient?.Dispose();

        protected virtual void Page_Load(object sender, EventArgs e)
        {
            if (!Request.IsAuthenticated)
            {
                Response.StatusCode = (int)HttpStatusCode.NotFound;
                Response.Redirect("~/404.aspx");
                return;
            }

            var userClaims = User.Identity as ClaimsIdentity;
            GraphQLClient = new GraphQLHttpClient(new GraphQLHttpClientOptions
            {
                EndPoint = new Uri(ConfigurationManager.AppSettings["Resource"])
            });

            (GraphQLClient as GraphQLHttpClient).DefaultRequestHeaders.Add(
                name: "Authorization",
                value: $"Bearer {userClaims.Claims.Where(claim => claim.Type == "access_token").FirstOrDefault().Value}"
            );
        }
    }
}