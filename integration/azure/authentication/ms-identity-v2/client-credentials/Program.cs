﻿using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using GraphQL.Client.Http;
using GraphQL.Common.Response;

namespace WorkflowGenExample
{
    public class Program
    {
        private static async Task Main(string[] args)
        {
            // Configuration using json file
            var config = new OIDCConfiguration();

            new ConfigurationBuilder()
                .SetBasePath(AppContext.BaseDirectory)
                .AddJsonFile(path: "appsettings.json", optional: false)
                .Build()
                .Bind(key: "Oidc", config);

            // Authentication using oAuth2 Client Credentials Grant flow
            using var tokenClient = new HttpClient();
            tokenClient.DefaultRequestHeaders.Clear();

            var content = new FormUrlEncodedContent(new[]
            {
                new KeyValuePair<string, string>("grant_type", "client_credentials"),
                new KeyValuePair<string, string>("client_id", config.ClientId),
                new KeyValuePair<string, string>("client_secret", config.ClientSecret),
                new KeyValuePair<string, string>("resource", config.Resource)
            });

            content.Headers.Clear();
            content.Headers.Add("Content-Type", "application/x-www-form-urlencoded");

            var tokenResponse = await tokenClient.PostAsync(requestUri: config.TokenEndpoint, content);

            if (!tokenResponse.IsSuccessStatusCode)
                throw new Exception(tokenResponse.ReasonPhrase);

            var clientCreds = JsonConvert.DeserializeObject<ClientCredentialsResponse>(await tokenResponse.Content.ReadAsStringAsync());
            var lastCheckedDate = new DateTime(1970, 1, 1, 0, 0, 0, kind: DateTimeKind.Local); // EPOCH

            while (true)
            {
                using var graphqlClient = new GraphQLHttpClient(config.Resource);
                GraphQLResponse graphqlResponse;
                var currentPage = 1;

                graphqlClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {clientCreds.access_token}");

                do
                {
                    graphqlResponse = await graphqlClient.SendQueryAsync(GQLFactory.GetViewerActions(
                        pageNumber: currentPage,
                        pageSize: 10,
                        actionsCreatedSince: lastCheckedDate
                    ));

                    if (graphqlResponse.Errors?.Count() > 0)
                        throw new Exception(graphqlResponse.Errors[0].Message);

                    var actionItems = (
                        from item in graphqlResponse.Data.viewer.actions.items as IEnumerable<dynamic>
                        select (item as JObject).ToObject<Action>()
                    ).ToList();

                    if (actionItems.Count() <= 0)
                        Console.WriteLine("No new actions.");
                    else
                        actionItems.ForEach(WriteNewAction);

                    currentPage++;
                } while ((bool)graphqlResponse.Data.viewer.actions.hasNextPage.Value);

                lastCheckedDate = DateTime.Now;

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
