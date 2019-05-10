import { AuthenticationContext } from 'react-adal';

export default class Configuration {
  get authenticationContext () {
    return new AuthenticationContext({
      clientId: this.clientId,
      redirectUri: this.redirectUri,
      tenant: this.tenant,
      endpoints: {
        workflowgenGraphQLApi: this.resource
      }
    });
  }

  constructor (config) {
    this.clientId = config.client_id;
    this.redirectUri = config.redirect_uri;
    this.tenant = config.tenant_id;
    this.resource = config.resource;
  }

  static async load () {
    let config = window.localStorage.getItem('config');

    if (config) {
      config = JSON.parse(config);
    } else {
      config = await (await window.fetch('api/Configuration/Client')).json();

      window.localStorage.setItem('config', JSON.stringify(config));
    }

    return new Configuration(config);
  }
}
