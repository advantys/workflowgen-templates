import { base64url } from 'rfc4648';

/**
 * Validates the token's signature. If no signature, succeeds.
 * @param {string} token The unparsed id token to be verified.
 * @param {string} metadataUrl The url to the OpenID Connect metadata endpoint.
 * @returns {Promise<boolean>} True if validation succeeds. False otherwise.
 */
export async function validateTokenSignature (token, metadataUrl) {
  if (!window.Crypto) {
    throw new Error('Your browser is not supported by this application.');
  }

  const subtleCrypto = window.crypto.subtle;
  const [headerStr, payloadStr, sigStr] = token.split('.');
  const [header] = getTokenParts(token);
  const signedPart = `${headerStr}.${payloadStr}`;

  // No need for verification if token not signed.
  if (!sigStr || header.alg === 'none') {
    return true;
  }

  return subtleCrypto.verify(
    'RSASSA-PKCS1-v1_5',
    await getCryptoKeyFromMetadataUrl(metadataUrl, header.kid),
    base64url.parse(sigStr, { loose: true }),
    new TextEncoder().encode(signedPart)
  );
}

/**
 * Verify the at_hash value of the id token against the access token. This verifies
 * that the access token is supposed to be used with the id token's user.
 * @param {string} atHashValue The id token's at_hash value.
 * @param {string} accessToken The unparsed access token.
 * @returns {Promise<boolean>} True if succeeds. False otherwise.
 */
export async function verifyAtHash (atHashValue, accessToken) {
  if (!window.Crypto) {
    throw new Error('Your browser is not supported by this application.');
  }

  const subtleCrypto = window.crypto.subtle;
  const hashedAccessTokenBuffer = await subtleCrypto.digest(
    'SHA-256',
    new TextEncoder().encode(accessToken)
  );
  const hashedAccessTokenByteArray = Array.from(new Uint8Array(hashedAccessTokenBuffer));
  const leftMostPart = base64url.stringify(
    hashedAccessTokenByteArray.slice(0, hashedAccessTokenByteArray.length / 2),
    { pad: false }
  );

  return atHashValue === leftMostPart;
}

// The following commented code should be used to when you want to use the Authorization
// Code flow with PKCE which is the recommended flow for Single Page Applications.
// At the time of writing, Microsoft Identity Platform's token endpoints don't
// return CORS headers. The consequence is that the SPA cannot make a call to
// exchange a code for tokens in the back channel. Passing by a proxy on the server
// side of this SPA don't work either because, per the redirect uri, the platform
// expects a client secret because it considers the call to come from a classic web application.

// export function generateCodeVerifier () {
//   if (!window.Crypto) {
//     throw new Error('Your browser is not supported by this application.');
//   }

//   const buffer = new Uint8Array(32);
//   window.crypto.getRandomValues(buffer);
//   return base64url.stringify(buffer, { pad: false });
// }

// export async function generateCodeChallenge (codeVerifier) {
//   if (!window.Crypto) {
//     throw new Error('Your browser is not supported by this application.');
//   }

//   const subtleCrypto = window.crypto.subtle;
//   const verifierData = new TextEncoder().encode(codeVerifier);
//   const verifierDataHashBuf = new Uint8Array(await subtleCrypto.digest('SHA-256', verifierData));

//   return base64url.stringify(verifierDataHashBuf, { pad: false });
// }

/**
 * Gets the public key associated with the with a specific key id.
 * @param {string} metadataUrl The OIDC well known metadata URL.
 * @param {string} kid The key identifier. It is generally contained in the JWS headers.
 * @returns {Promise<CryptoKey>} The Web Crypto representation of the key.
 */
async function getCryptoKeyFromMetadataUrl (metadataUrl, kid) {
  if (!window.Crypto) {
    throw new Error('Your browser is not supported by this application.');
  }

  const subtleCrypto = window.crypto.subtle;
  let metadata = window.localStorage.getItem('metadata');

  if (!metadata) {
    metadata = await (await window.fetch(metadataUrl)).json();
  } else {
    metadata = JSON.parse(metadata);
  }

  const jwks = await (await window.fetch(metadata.jwks_uri)).json();
  const jwk = jwks.keys.find(k => k.kid === kid);
  return subtleCrypto.importKey(
    'jwk',
    jwk,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256'
    },
    false,
    ['verify']
  );
}

/**
 * Splits a token into parts: header, payload and signature.
 * @param {string} token The token to be parsed.
 * @returns {string[]} The header, payload and signature in this order.
 */
function getTokenParts (token) {
  return token
    .split('.')
    .slice(0, -1)
    .map(base64StringFromBase64UrlEncoded)
    .map(window.atob)
    .map(str => JSON.parse(str));
}

/**
 * Poor man's function to convert a base64 url encoded string into a base64 string.
 * @param {string} base64UrlEncoded The base64 url encoded string to converted.
 * @returns {string} The regulare base64 representation of the passed url encoded string.
 */
function base64StringFromBase64UrlEncoded (base64UrlEncoded) {
  let result = base64UrlEncoded
    .replace('_', '/')
    .replace('-', '+');

  switch (result.length % 2) {
    case 2:
      result += '==';
      break;

    case 3:
      result += '=';
      break;

    default: break;
  }

  return result;
}
