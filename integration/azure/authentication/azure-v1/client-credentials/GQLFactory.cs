using System;
using GraphQL.Common.Request;

namespace WorkflowGenExample
{
    public static class GQLFactory
    {
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
                Variables = new
                {
                    pageNumber = pageNumber,
                    pageSize = pageSize,
                    // From the docs:
                    //      The "O" or "o" standard format specifier represents a
                    //      custom date and time format string using a pattern that
                    //      preserves time zone information and emits a result string
                    //      that complies with ISO 8601.
                    actionsCreatedSince = actionsCreatedSince.ToString(format: "o")
                }
            };
    }
}
