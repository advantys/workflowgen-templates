using System;
using GraphQL.Common.Request;

namespace WorkflowGenExample
{
    public static class GQLFactory
    {
        public static GraphQLRequest GetViewerActions(int pageNumber, int pageSize)
            => new GraphQLRequest
            {
                Query = @"
                    query ViewerActions($pageNumber: Int, $pageSize: Int) {
                        viewer {
                            actions(page: {number: $pageNumber, size: $pageSize}) {
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
                    pageSize = pageSize
                }
            };
    }
}
