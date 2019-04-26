using System;
using System.Threading.Tasks;
using System.Threading;
using System.IO;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Configuration.Json;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using GraphQL.Client.Http;

namespace WorkflowGenExample
{
    public class Program
    {
        private static async Task Main(string[] args)
        {
            // Configuration using json file
            var config = new OIDCConfiguration();
            ClientCredentialsResponse clientCreds;

            new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile(path: "appsettings.json", optional: false)
                .Build()
                .Bind(key: "Oidc", config);

            // Authentication using oAuth2 Client Credentials Grant flow
            using (var client = new HttpClient())
            {
                client.DefaultRequestHeaders.Clear();

                var content = new FormUrlEncodedContent(new[]
                {
                    new KeyValuePair<string, string>("grant_type", "client_credentials"),
                    new KeyValuePair<string, string>("client_id", config.ClientId),
                    new KeyValuePair<string, string>("client_secret", config.ClientSecret),
                    new KeyValuePair<string, string>("resource", config.Resource)
                });

                content.Headers.Clear();
                content.Headers.Add("Content-Type", "application/x-www-form-urlencoded");

                var response = await client.PostAsync(requestUri: config.TokenEndpoint, content);

                if (!response.IsSuccessStatusCode)
                    throw new Exception(response.ReasonPhrase);

                clientCreds = JsonConvert.DeserializeObject<ClientCredentialsResponse>(await response.Content.ReadAsStringAsync());
            }

            var ids = new List<string>();
            var currentPage = 1; // GraphQL lists are 1-based

            while (true) {
                using (var client = new GraphQLHttpClient(config.Resource))
                {
                    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {clientCreds.access_token}");

                    var response = await client.SendQueryAsync(GQLFactory.GetViewerActions(pageNumber: currentPage, pageSize: 10));

                    if ((bool)response.Data.viewer.actions.hasNextPage)
                        currentPage++;

                    if (response.Errors?.Count() > 0)
                        throw new Exception(response.Errors[0].Message);

                    var actionItems = (from item in response.Data.viewer.actions.items as IEnumerable<dynamic>
                        where !ids.Contains(item.id.Value as string)
                        select (item as JObject).ToObject<Action>()).ToList();

                    if (actionItems.Count <= 0)
                        Console.WriteLine("No new actions.");
                    else
                        actionItems.ForEach(WriteNewAction);

                    ids.AddRange(actionItems.Select(item => item.id));
                }

                Task.Delay(TimeSpan.FromMinutes(1)).Wait();
            }
        }

        private static void WriteNewAction(Action action)
        {
            Console.WriteLine();
            Console.WriteLine($@"
---------- ACTION {action.id} ----------
Process Name: {action.activity.process.name}

Activity:
    Id: {action.activity.id}
    Name: {action.activity.name}
    Description:
        {action.activity.description}
    Has Quick Approval: {(action.activity.hasQuickApproval ? "Yes" : "No")}

Initiator:
    Id: {action.initiator.id}
    Username: {action.initiator.userName}
    First Name: {action.initiator.firstName}
    Last Name: {action.initiator.lastName}

Assignee:
    Id: {action.assignee.id}
    Username: {action.assignee.userName}
    First Name: {action.assignee.firstName}
    Last Name: {action.assignee.lastName}
---------- END ACTION -----------
            ");
            Console.WriteLine();
        }
    }

    public class Action
    {
        public string id { get; set; }
        public User initiator { get; set; }
        public User assignee { get; set; }
        public Activity activity { get; set; }
    }

    public class User
    {
        public string id { get; set; }
        public string userName { get; set; }
        public string firstName { get; set; }
        public string lastName { get; set; }
    }

    public class Activity
    {
        public string id { get; set; }
        public string name { get; set; }
        public string description { get; set; }
        public bool hasQuickApproval { get; set; }
        public Process process { get; set; }
    }

    public class Process
    {
        public string name { get; set; }
    }

    public sealed class ClientCredentialsResponse
    {
        public string access_token { get; set; }
        public string token_type { get; set; }
        public int expires_in { get; set; }
    }

    public sealed class OIDCConfiguration
    {
        public string ClientId { get; set; }
        public string ClientSecret { get; set; }
        public string Resource { get; set; }
        public string Authority { get; set; }
        public string TokenEndpoint => $"{Authority}/oauth2/token";
    }
}
