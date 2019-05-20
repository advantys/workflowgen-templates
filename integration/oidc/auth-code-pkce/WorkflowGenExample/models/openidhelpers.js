/**
 * Some code present here were taken from the following sources:
 * - https://github.com/auth0/node-jwks-rsa/blob/master/src/JwksClient.js
 * - https://github.com/auth0/node-jwks-rsa/blob/master/src/utils.js
 */
/* global var fetch */ // eslint-disable-line
import AsyncStorage from '@react-native-community/async-storage';

export async function getMetadata (config) {
  let metadata = await AsyncStorage.getItem('metadata');

  if (metadata) {
    metadata = JSON.parse(metadata);
  } else {
    metadata = await (await fetch(config.metadataUrl)).json();
    AsyncStorage.setItem('metadata', JSON.stringify(metadata));
  }

  return metadata;
}

function certToPEM (cert) {
  cert = cert.match(/.{1,64}/g).join('\n');
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;
  return cert;
}

async function getKeys (jwksUri) {
  const res = await fetch(jwksUri);

  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const json = await res.json();
  return json.keys || [];
}

async function getSigningKeys (jwksUri) {
  const keys = await getKeys(jwksUri);

  return keys
    .filter(key =>
      key.use === 'sig' && key.kty === 'RSA' && key.kid && ((key.x5c && key.x5c.length) || (key.n && key.e))
    )
    .map(key => key.x5c && key.x5c.length
      ? {
        kid: key.kid,
        nbf: key.nbf,
        publicKey: certToPEM(key.x5c[0])
      }
      : null)
    .filter(obj => !!obj);
}

export async function getKey (kid, jwkUri) {
  const keys = await getSigningKeys(jwkUri);
  const key = keys.find(k => k.kid === kid);

  if (!key) {
    throw new Error(`Unable to find a signing key that matches '${kid}'`);
  }

  return key;
}
