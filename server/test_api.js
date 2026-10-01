const http = require('http');
const app = require('./server');

const PORT = 5001; // test port

const runTests = async () => {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`\n==================================================`);
  console.log(`🧪 Running TaskFlow Automated API Verification Suite`);
  console.log(`==================================================\n`);

  let passed = 0;
  let failed = 0;

  const request = (path, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port: PORT,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          let json = null;
          try {
            json = JSON.parse(data);
          } catch (e) {
            json = data;
          }
          resolve({ status: res.statusCode, data: json });
        });
      });

      req.on('error', reject);

      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  };

  const assert = (name, condition, details = '') => {
    if (condition) {
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${name} - ${details}`);
      failed++;
    }
  };

  try {
    // 1. Health check endpoint
    const healthRes = await request('/health');
    assert(
      'GET /health returns 200 with status ok',
      healthRes.status === 200 && healthRes.data.status === 'ok',
      JSON.stringify(healthRes.data)
    );

    // 2. Health check under /api/health
    const apiHealthRes = await request('/api/health');
    assert(
      'GET /api/health returns 200 with status ok',
      apiHealthRes.status === 200 && apiHealthRes.data.status === 'ok',
      JSON.stringify(apiHealthRes.data)
    );

    // 3. 404 handler for unknown route
    const notFoundRes = await request('/api/non-existent-route-12345');
    assert(
      '404 handler returns success: false on unknown routes',
      notFoundRes.status === 404 && notFoundRes.data.success === false,
      JSON.stringify(notFoundRes.data)
    );

    // 4. Missing JWT authentication error
    const noTokenRes = await request('/tasks');
    assert(
      'GET /tasks without token returns 401',
      noTokenRes.status === 401 && noTokenRes.data.success === false,
      JSON.stringify(noTokenRes.data)
    );

    // 5. Invalid JWT authentication error
    const invalidTokenRes = await request('/tasks', 'GET', null, {
      Authorization: 'Bearer invalid_garbage_token_123',
    });
    assert(
      'GET /tasks with invalid token returns 401',
      invalidTokenRes.status === 401 && invalidTokenRes.data.success === false,
      JSON.stringify(invalidTokenRes.data)
    );

    // 6. User routes protected without JWT
    const noTokenUsersRes = await request('/users');
    assert(
      'GET /users without token returns 401',
      noTokenUsersRes.status === 401 && noTokenUsersRes.data.success === false,
      JSON.stringify(noTokenUsersRes.data)
    );

    // 7. Register validation - missing fields
    const emptyRegRes = await request('/register', 'POST', {});
    assert(
      'POST /register with empty body returns 400',
      emptyRegRes.status === 400 && emptyRegRes.data.success === false,
      JSON.stringify(emptyRegRes.data)
    );

    // 8. Register validation - weak password (missing special character/numbers)
    const weakPassRes = await request('/register', 'POST', {
      name: 'Test',
      email: 'valid@example.com',
      password: 'passwordonly',
    });
    assert(
      'POST /register with weak password returns 400 complexity error',
      weakPassRes.status === 400 && weakPassRes.data.success === false,
      JSON.stringify(weakPassRes.data)
    );

    // 9. Register validation - invalid email format
    const badEmailRes = await request('/register', 'POST', {
      name: 'Test',
      email: 'not-an-email',
      password: 'ValidPassword@123',
    });
    assert(
      'POST /register with bad email format returns 400',
      badEmailRes.status === 400 && badEmailRes.data.success === false,
      JSON.stringify(badEmailRes.data)
    );

    // 10. Login validation - missing fields
    const emptyLoginRes = await request('/login', 'POST', {});
    assert(
      'POST /login with missing fields returns 400',
      emptyLoginRes.status === 400 && emptyLoginRes.data.success === false,
      JSON.stringify(emptyLoginRes.data)
    );
  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    console.log(`\n--------------------------------------------------`);
    console.log(`📊 Test Summary: ${passed} passed, ${failed} failed`);
    console.log(`--------------------------------------------------\n`);
    process.exit(failed > 0 ? 1 : 0);
  }
};

runTests();
