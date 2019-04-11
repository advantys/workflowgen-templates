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
        private readonly IConfiguration _config;
        private readonly IGraphQLClient _graphqlClient;

        public WorkflowGenProfileModel(IConfiguration config, IGraphQLClient client)
            : base()
        {
            _config = config;
            _graphqlClient = client;
        }

        public async Task OnGetAsync()
        {
            var request = new GraphQLRequest
            {
                Query = @"
                query {
                    viewer {
                        defaultLanguage,
                        directory {
                            name
                        }
                        id
                        firstName
                        lastName
                    }
                }
                "
            };
            var response = await _graphqlClient.SendQueryAsync(request);

            ViewData["WFGUser"] = response.GetDataFieldAs<WFGUser>("viewer");
        }

        public struct WFGUser
        {
            public string defaultLanguage { get; set; }
            public WFGDirectory directory { get; set; }
            public string id { get; set; }
            public string firstName { get; set; }
            public string lastName { get; set; }
        }

        public struct WFGDirectory
        {
            public string name { get; set; }
        }
    }
}
