const axios = require("axios");
const crypto = require("crypto-js");
async function Fetch(path) {
  const accessKeyId = process.env.SECRET_ID;
  const secretAccessKey = process.env.SECRET_KEY;
  const region = "auto";
  const service = "s3";
  const host = process.env.HOST; // Replace with your Cloudflare account ID
  const method = "GET";
  const currentDate = new Date();

  const amzDate =
    currentDate
      .toISOString()
      .replace(/[:-]|\.\d{3}/g, "")
      .substr(0, 15) + "Z";
  const dateStamp = amzDate.substr(0, 8);
  var payloadHash = "UNSIGNED-PAYLOAD";
  const canonicalUri = `/thunder-streams/${path}\n`;
  const canonicalHeaders = `host:${host}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
  const signedHeaders = "host;x-amz-content-sha256;x-amz-date";
  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = `${algorithm}\n${amzDate}\n${credentialScope}\n${crypto
    .SHA256(canonicalRequest)
    .toString(crypto.enc.Hex)}`;
  function getSignatureKey(key, dateStamp, regionName, serviceName) {
    const kDate = crypto.HmacSHA256(dateStamp, "AWS4" + key);
    const kRegion = crypto.HmacSHA256(regionName, kDate);
    const kService = crypto.HmacSHA256(serviceName, kRegion);
    const kSigning = crypto.HmacSHA256("aws4_request", kService);
    return kSigning;
  }
  const signingKey = getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = crypto
    .HmacSHA256(stringToSign, signingKey)
    .toString(crypto.enc.Hex);

  const authorizationHeader = `${algorithm} Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  let config = {
    method: "GET",
    url: `https://${host}/thunder-streams/${path}`,
    headers: {
      Authorization: authorizationHeader,
      Host: host,
      "x-amz-content-sha256": payloadHash,
      "x-amz-date": amzDate,
    },
    responseType: "stream",
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  };
  try {
    const t = await axios.request(config);
    return t;
  } catch (e) {
    console.log(e);
  }
}

module.exports = Fetch;
