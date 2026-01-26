const jwt = require('jsonwebtoken');
const fs = require('fs');

// Apple Sign-In credentials
const TEAM_ID = 'HMLV274G9F';
const KEY_ID = process.argv[2]; // Pass as command line argument
const CLIENT_ID = 'com.crupid.mobile.signin';

const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQggMWezRfxvJ6OKP1D
H5yy3obpgMbB86F0epAlxuGJdrygCgYIKoZIzj0DAQehRANCAARhVahKKHfEzseP
iohXyf9xN5oNEve3zV1oGqpewfQRJTMpV3igz0gCypPEVfLspivNKHPW3SlZ75kn
YLPJJS0x
-----END PRIVATE KEY-----`;

if (!KEY_ID) {
  console.error('Error: Please provide the Key ID as an argument');
  console.error('Usage: node generate-apple-jwt.js <KEY_ID>');
  process.exit(1);
}

// Generate JWT
const token = jwt.sign(
  {
    iss: TEAM_ID,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (86400 * 180), // 180 days
    aud: 'https://appleid.apple.com',
    sub: CLIENT_ID,
  },
  PRIVATE_KEY,
  {
    algorithm: 'ES256',
    keyid: KEY_ID,
  }
);

console.log('\n=== Apple Sign-In JWT Secret ===\n');
console.log(token);
console.log('\n================================\n');
console.log('Copy the token above and paste it into Supabase as the "Secret key"');
console.log('This token is valid for 180 days.\n');
