import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { gql } from 'apollo-boost';

export function buildApolloClient (graphqlEndpoint, accessToken) {
  return new ApolloClient({
    link: buildLinks(graphqlEndpoint, accessToken),
    cache: new InMemoryCache()
  });
}

export function buildLinks (graphqlEndpoint, accessToken) {
  const httpLink = createHttpLink({ uri: graphqlEndpoint });
  const authLink = setContext((_, { headers }) => ({
    headers: {
      ...headers,
      authorization: accessToken ? `Bearer ${accessToken}` : ''
    }
  }));

  return authLink.concat(httpLink);
}

const GQLFactory = Object.freeze({
  query: {
    getViewerProfile () {
      return gql`
        {
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
});

export {
  GQLFactory
};
