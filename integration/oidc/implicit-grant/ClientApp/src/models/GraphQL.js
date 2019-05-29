import React from 'react';
import { GraphQLClient } from 'graphql-request';

export const GraphQLContext = React.createContext();

export function buildGraphQLClient (endpoint, accessToken) {
  return new GraphQLClient(endpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
}

export class GQLFactory {
  static get viewerProfile () {
    return `
      query {
        viewer {
          firstName
          lastName
          userName
          defaultLanguage
        }
      }
    `;
  }
}
