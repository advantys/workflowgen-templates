export default class Configuration {
  get authority () {
    return `https://login.microsoftonline.com/${this.tenant}`;
  }

  get metadataUrl () {
    return `${this.authority}/v2.0/.well-known/openid-configuration`;
  }

  constructor (config) {
    this.clientId = config.client_id;
    this.redirectUri = config.redirect_uri;
    this.tenant = config.tenant_id;
    this.resource = config.resource;
  }

  async getMetadata () {
    let metadata = window.localStorage.getItem('metadata');

    if (metadata) {
      return JSON.parse(metadata);
    }

    metadata = await (await window.fetch(this.metadataUrl)).json();
    window.localStorage.setItem('metadata', JSON.stringify(metadata));

    return metadata;
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
