using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using GraphQL.Client;
using GraphQL.Common.Request;

namespace oidc.Pages
{
    public class WorkflowGenProfileModel : PageModel
    {
        private readonly IConfiguration config;
        private readonly IGraphQLClient graphqlClient;

        public WorkflowGenProfileModel(IConfiguration config, IGraphQLClient client)
            : base()
        {
            this.config = config;
            this.graphqlClient = client;
        }

        public async Task OnGetAsync()
        {
            var request = new GraphQLRequest
            {
                Query = @"
                query {
                    viewer {
                        defaultLanguage,
                        id
                        firstName
                        lastName
                    }
                }
                "
            };
            var response = await graphqlClient.SendQueryAsync(request);

            ViewData["WFGUser"] = response.GetDataFieldAs<WorkflowGenUser>("viewer");
        }

        public struct WorkflowGenUser
        {
            public string defaultLanguage { get; set; }
            public string id { get; set; }
            public string firstName { get; set; }
            public string lastName { get; set; }
        }
    }
}
