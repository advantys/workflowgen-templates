using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using WorkflowGenExample.Pages;
using GraphQL.Common.Request;

namespace WorkflowGenExample
{
    public partial class WorkflowGenProfile : ProtectedPage
    {
        protected override void Page_Load(object sender, EventArgs e)
        {
            base.Page_Load(sender, e);
            RegisterAsyncTask(new PageAsyncTask(LoadData));
            ExecuteRegisteredAsyncTasks();
        }

        private async Task LoadData()
        {
            var response = await GraphQLClient.SendQueryAsync(new GraphQLRequest
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
            });

            foreach (var prop in response.Data.viewer)
            {
                var row = new TableRow();

                row.Cells.AddRange(new[]
                {
                    new TableCell { Text = prop.Name, CssClass = "text-right font-weight-bold" },
                    new TableCell { Text = prop.Value.Value }
                });
                profileTable.Rows.Add(row);
            }
        }
    }
}