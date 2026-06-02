const crypto = require('crypto');

// Generate ECDH P-256 keypair (same curve as P-256 for ECDSA / Web Push)
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1'
});

// Get uncompressed public key (65 bytes, starting with 0x04)
const pubBuffer = publicKey.export({ type: 'spki', format: 'der' });
// SPKI DER contains the uncompressed public key (65 bytes) at the end.
// Let's get the raw 65 bytes:
const rawPubKey = publicKey.export({ type: 'pkcs1', format: 'der' }).slice(-65);

// Get raw private key (32 bytes)
const privBuffer = privateKey.export({ type: 'pkcs8', format: 'der' });
const rawPrivKey = privateKey.export({ type: 'sec1', format: 'der' }).slice(7, 39); // extract the 32-byte private scalar d

// Convert to base64url
function toBase64Url(buf) {
  return buf.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

const vapidPublic = toBase64Url(rawPubKey);
const vapidPrivate = toBase64Url(rawPrivKey);

console.log("VAPID_PUBLIC_KEY=" + vapidPublic);
console.log("VAPID_PRIVATE_KEY=" + vapidPrivate);
