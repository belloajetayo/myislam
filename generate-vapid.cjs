const crypto = require('crypto');

(async () => {
  const keyPair = await crypto.webcrypto.subtle.generateKey(
    { name: "ECDSA", namedCurve: "P-256" },
    true,
    ["sign", "verify"]
  );
  
  const pubRaw = new Uint8Array(await crypto.webcrypto.subtle.exportKey("raw", keyPair.publicKey));
  const privJwk = await crypto.webcrypto.subtle.exportKey("jwk", keyPair.privateKey);
  
  function base64url(buf) {
    return Buffer.from(buf).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  
  const vapidPublic = base64url(pubRaw);
  const vapidPrivate = privJwk.d;
  
  console.log("VAPID_PUBLIC_KEY=" + vapidPublic);
  console.log("VAPID_PRIVATE_KEY=" + vapidPrivate);
})();
