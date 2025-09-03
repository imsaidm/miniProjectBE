const http = require('http');

function httpPostJson(path, payload) {
  const data = Buffer.from(JSON.stringify(payload));
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: 'localhost',
        port: 4400,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': data.length,
        },
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => resolve({ status: res.statusCode, body }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

(async () => {
  try {
    const email = `tempmail_${Date.now()}@test.example`;
    const registerRes = await httpPostJson('/api/auth/register', {
      email,
      password: 'secret123',
      name: 'Temp User',
    });
    console.log('REGISTER STATUS:', registerRes.status);
    console.log('REGISTER BODY:', registerRes.body);
    let token;
    try {
      token = JSON.parse(registerRes.body).verifyToken;
    } catch (e) {}
    if (!token) {
      console.log('No verifyToken in response. Ensure NODE_ENV!=production for token echo.');
      return;
    }
    const verifyRes = await httpPostJson('/api/auth/verify-email', { token });
    console.log('VERIFY STATUS:', verifyRes.status);
    console.log('VERIFY BODY:', verifyRes.body);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();


