import config from '../config';
import Url from './Url';

export default class Configuration {
  get metadataUrl () {
    return new Url({
      baseUrl: 'https://login.microsoftonline.com',
      pathComponents: [this.tenantId, '.well-known', 'openid-configuration']
    }).toString();
  }

  static load () {
    const c = new Configuration();

    c.tenantId = config.oidc.tenantId;
    c.clientId = config.oidc.clientId;
    c.audience = config.oidc.audience;

    return c;
  }
}
