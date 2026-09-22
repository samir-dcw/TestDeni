const REQUIRED_FIELDS = ['email', 'firstname', 'lastname'];
const CUSTOMER_TYPE = 'new-commerce-customer';

function normalizeValue(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function extractCustomer(params) {
  return params && params.data && params.data.value ? params.data.value : {};
}

function validateCustomer(customer) {
  const missingFields = REQUIRED_FIELDS.filter((field) => !normalizeValue(customer[field]));
  return missingFields;
}

function buildProcessedCustomer(customer) {
  const customerId = customer.id;
  const firstname = normalizeValue(customer.firstname);
  const lastname = normalizeValue(customer.lastname);
  const email = normalizeValue(customer.email);
  const fullName = `${firstname} ${lastname}`.trim();

  return {
    customerId,
    fullName,
    email,
    customerType: CUSTOMER_TYPE,
    processed: true,
  };
}

function logSuccess(processedCustomer) {
  console.log('Commerce customer event received');
  console.log(`Customer ID: ${processedCustomer.customerId}`);
  console.log(`Full Name: ${processedCustomer.fullName}`);
  console.log(`Email: ${processedCustomer.email}`);
  console.log(`Customer Type: ${processedCustomer.customerType}`);
  console.log(`Processed: ${processedCustomer.processed}`);
}

function logValidationFailure(missingFields) {
  console.warn('Commerce customer event validation failed');
  console.warn(`Missing required field(s): ${missingFields.join(', ')}`);
  console.warn('Processed: false');
}

async function main(params) {
  try {
    const customer = extractCustomer(params);
    const missingFields = validateCustomer(customer);

    if (missingFields.length > 0) {
      const message = `Missing required field(s): ${missingFields.join(', ')}`;
      logValidationFailure(missingFields);
      return {
        statusCode: 400,
        headers: { 'content-type': 'application/json' },
        body: { processed: false, error: message },
      };
    }

    const processedCustomer = buildProcessedCustomer(customer);
    logSuccess(processedCustomer);

    return {
      statusCode: 200,
      headers: { 'content-type': 'application/json' },
      body: processedCustomer,
    };
  } catch (error) {
    console.error('Commerce customer event processing failed', {
      eventName: 'observer.customer_save_commit_after',
      error: error instanceof Error ? error.message : String(error),
    });

    return {
      statusCode: 500,
      headers: { 'content-type': 'application/json' },
      body: { processed: false },
    };
  }
}

module.exports = {
  main,
  normalizeValue,
  extractCustomer,
  validateCustomer,
  buildProcessedCustomer,
};
