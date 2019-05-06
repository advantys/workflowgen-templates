using System;
using GraphQL.Common.Request;

namespace WorkflowGenExample
{
    public static class GQLFactory
    {
        private const string ISO8601DateTimeFormat = "yyyy-MM-ddTHH\\:mm\\:ss.fffffffzzz";

        public static GraphQLRequest GetViewerActions(int pageNumber, int pageSize, DateTime actionsCreatedSince)
            => new GraphQLRequest
            {
                Query = @"
query ViewerActions($pageNumber: Int, $pageSize: Int, $actionsCreatedSince: DateTime) {
    viewer {
        actions(
            page: {
                number: $pageNumber,
                size: $pageSize
            },
            filter: {
                createdSince: $actionsCreatedSince
            }
        ) {
            totalCount
            hasNextPage
            hasPreviousPage
            items {
                id
                initiator {
                    ...userFragment
                }
                assignee {
                    ...userFragment
                }
                activity {
                    description
                    hasQuickApproval
                    id
                    name
                    process {
                        name
                    }
                }
            }
        }
    }
}

fragment userFragment on User {
    id
    userName
    firstName
    lastName
}
                ",
                Variables = new {
                    pageNumber = pageNumber,
                    pageSize = pageSize,
                    actionsCreatedSince = actionsCreatedSince.ToString(format: ISO8601DateTimeFormat)
                }
            };
    }
}
