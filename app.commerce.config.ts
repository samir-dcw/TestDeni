import { defineConfig } from '@adobe/aio-commerce-lib-app/config';

export default defineConfig({
  metadata: {
    id: 'customer-save-processor',
    displayName: 'Customer Save Processor',
    description: 'Logs processed customer details when a Commerce customer is saved, triggered by observer.customer_save_commit_after.',
    version: '1.0.0',
  },
  eventing: {
    commerce: [
      {
        provider: {
          label: 'Commerce Events Provider',
          description: 'Processes customer save events from Adobe Commerce.',
        },
        events: [
          {
            name: 'observer.customer_save_commit_after',
            label: 'Customer Save Commit After',
            description: 'Triggered after a customer save commit completes.',
            fields: [
              { name: 'id' },
              { name: 'email' },
              { name: 'firstname' },
              { name: 'lastname' },
            ],
            runtimeActions: ['my-app/process-customer'],
          },
        ],
      },
    ],
  },
});
