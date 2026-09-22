const assert = require('assert');
const originalConsole = { ...console };

const action = require('./index.js');

function captureConsole() {
  const lines = [];
  console.log = (...args) => lines.push(['log', args.join(' ')]);
  console.warn = (...args) => lines.push(['warn', args.join(' ')]);
  console.error = (...args) => lines.push(['error', args.join(' ')]);
  return lines;
}

function restoreConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
}

async function run() {
  {
    const lines = captureConsole();
    const result = await action.main({
      data: {
        value: {
          id: 100245,
          email: 'john.doe@example.com',
          firstname: 'John',
          lastname: 'Doe',
        },
      },
    });
    restoreConsole();

    assert.strictEqual(result.statusCode, 200);
    assert.deepStrictEqual(result.body, {
      customerId: 100245,
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      customerType: 'new-commerce-customer',
      processed: true,
    });
    assert.deepStrictEqual(lines.map((entry) => entry[1]), [
      'Commerce customer event received',
      'Customer ID: 100245',
      'Full Name: John Doe',
      'Email: john.doe@example.com',
      'Customer Type: new-commerce-customer',
      'Processed: true',
    ]);
  }

  for (const [field, payload] of [
    ['email', { id: 1, firstname: 'John', lastname: 'Doe' }],
    ['firstname', { id: 1, email: 'john.doe@example.com', lastname: 'Doe' }],
    ['lastname', { id: 1, email: 'john.doe@example.com', firstname: 'John' }],
  ]) {
    const lines = captureConsole();
    const result = await action.main({ data: { value: payload } });
    restoreConsole();

    assert.strictEqual(result.statusCode, 400);
    assert.strictEqual(result.body.processed, false);
    assert.strictEqual(result.body.error, `Missing required field(s): ${field}`);
    assert.ok(lines.some((entry) => entry[1] === `Missing required field(s): ${field}`));
    assert.ok(lines.some((entry) => entry[1] === 'Processed: false'));
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
