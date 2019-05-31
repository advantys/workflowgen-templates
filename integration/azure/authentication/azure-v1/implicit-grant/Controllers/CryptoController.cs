using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Net.Http;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Text.RegularExpressions;
using System.Security.Cryptography.X509Certificates;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json.Linq;

namespace WorkflowGenExample.Controllers
{
    [Route("api/[controller]")]
    public class CryptoController : Controller
    {
        private readonly IConfiguration config;
        private readonly IHttpClientFactory clientFactory;

        public CryptoController(IConfiguration config, IHttpClientFactory clientFactory)
        {
            this.config = config;
            this.clientFactory = clientFactory;
        }

        [HttpPost("[action]")]
        public async Task<object> VerifyToken([FromBody]VerifyTokenRequest requestBody)
        {
            var metadataUrl = $"https://login.microsoftonline.com/{config["Oidc:TenantId"]}/.well-known/openid-configuration";
            var tokenParts = requestBody.token.Split(".");
            var (header, payload) = GetTokenParts(requestBody.token);

            // No need for verification if token not signed.
            if (string.IsNullOrEmpty(tokenParts.ElementAtOrDefault(2)) || (string)header["alg"] == "none") {
                return MakeResult(true);
            }

            var signedPart = string.Join('.', tokenParts.Take(2));
            var signingInput = Encoding.ASCII.GetBytes(signedPart);
            var client = clientFactory.CreateClient();
            var metadata = JObject.Parse(await client.GetStringAsync(metadataUrl));
            var jwks = JObject.Parse(await client.GetStringAsync((string)metadata["jwks_uri"]));
            var x5c = (
                from JObject key in jwks["keys"] as JArray
                where (key.ContainsKey("kid") && (string)key["kid"] == (string)header["kid"]) ||
                    (key.ContainsKey("x5t") && (string)key["x5t"] == (string)header["x5t"])
                select (string)key["x5c"][0]
            ).FirstOrDefault();
            var pem = $"-----BEGIN CERTIFICATE-----{Environment.NewLine}" +
                Regex.Replace(x5c, "(.{64})", $"$1{Environment.NewLine}") +
                $"{Environment.NewLine}-----END CERTIFICATE-----{Environment.NewLine}";
            var cert = new X509Certificate2(rawData: Encoding.ASCII.GetBytes(pem));
            var cng = cert.PublicKey.Key as RSACng;
            var signatureBytes = Convert.FromBase64String(Base64StringFromBase64UrlEncoded(tokenParts[2]));

            return MakeResult(cng.VerifyData(
                data: signingInput,
                signature: signatureBytes,
                hashAlgorithm: HashAlgorithmName.SHA256,
                padding: RSASignaturePadding.Pkcs1
            ));
        }

        [HttpPost("[action]")]
        public object VerifyAtHash([FromBody]VerifyAtHashRequest requestBody)
        {
            var sha256 = SHA256.Create();
            var accessTokenBytes = Encoding.ASCII.GetBytes(requestBody.access_token);
            byte[] hashedAccessToken = new byte[32];

            var hashSuccessful = sha256.TryComputeHash(
                source: accessTokenBytes,
                destination: hashedAccessToken,
                bytesWritten: out _
            );

            if (!hashSuccessful)
                return MakeError(new Exception("Failed to compute the SHA256 hash of the access token."));

            byte[] leftMostPart = hashedAccessToken.Take(hashedAccessToken.Length / 2).ToArray();
            var leftBase64UrlEncoded = Base64UrlEncode(leftMostPart);

            return MakeResult(leftBase64UrlEncoded == requestBody.at_hash);
        }

        private object MakeResult(bool result) => new
        {
            result = result
        };

        private object MakeError(Exception ex) => new
        {
            error = ex.GetType().ToString(),
            error_description = ex.Message
        };

        private (JObject header, JObject payload) GetTokenParts(string token)
        {
            var parts = token
                .Split(".")
                .Take(2)
                .Select(Base64StringFromBase64UrlEncoded)
                .Select(Convert.FromBase64String)
                .Select(Encoding.ASCII.GetString)
                .ToArray();

            return (
                header: JObject.Parse(parts[0]),
                payload: JObject.Parse(parts[1])
            );
        }

        private string Base64StringFromBase64UrlEncoded(string base64UrlEncoded)
        {
            var result = base64UrlEncoded
                .Replace('_', '/')
                .Replace('-', '+');

            switch (result.Length % 4)
            {
                case 2:
                    result += "==";
                    break;

                case 3:
                    result += "=";
                    break;
            }

            return result;
        }

        private string Base64UrlEncode(byte[] data)
        {
            var result = Convert.ToBase64String(data);

            return result
                .Replace('/', '_')
                .Replace('+', '-')
                .Replace("=", "");
        }

        public sealed class VerifyTokenRequest
        {
            public string token { get; set; }
        }

        public sealed class VerifyAtHashRequest
        {
            public string access_token { get; set; }
            public string at_hash { get; set; }
        }
    }
}
