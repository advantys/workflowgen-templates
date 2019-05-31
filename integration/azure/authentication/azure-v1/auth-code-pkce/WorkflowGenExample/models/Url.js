export default class Url {
  constructor (params = {}) {
    const {
      baseUrl,
      query = {},
      pathComponents = []
    } = params;

    if (!baseUrl || typeof baseUrl !== 'string') {
      throw new Error('You must specify a base url and it must be a string.');
    }

    this.baseUrl = baseUrl;
    this.pathComponents = pathComponents;
    this.query = query;
  }

  toString () {
    const baseUrl = this.baseUrl.endsWith('/')
      ? this.baseUrl.slice(0, -1)
      : this.baseUrl;
    const queryValue = Object.entries(this.query)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    const parts = [baseUrl].concat(this.pathComponents);

    if (queryValue) {
      return `${parts.join('/')}?${queryValue}`;
    }

    return parts.join('/');
  }

  static parse (url) {
    const [ baseAndPath, queryString ] = url.split('?');
    const query = queryString
      ? queryString
        .split('&')
        .map(expr => expr.split('='))
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {})
      : {};

    return new Url({
      baseUrl: baseAndPath,
      query
    });
  }
}
