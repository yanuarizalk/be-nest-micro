export default () => ({
  env: process.env.ENV ?? 'DEV',
  port: {
    // sub app service port / address
    user: parseInt(process.env.USER_SERVICE_ADDRESS, 10) || 3001,
    auth: parseInt(process.env.AUTH_SERVICE_ADDRESS, 10) || 3002,
  },
  database: {
    uri: process.env.DATABASE_URI ?? 'mongodb://localhost:27017',
  },
  broker: {
    uri: process.env.BROKER_URI ?? 'amqp://localhost:5672',
    queue: process.env.BROKER_QUEUE,
  },
  secrets: {
    jwt: process.env.SECRET_JWT ?? 'siomFgvp3490R583mfOpwcm3ir4mf',
  },
  inProduction: function (): boolean {
    return /^prod$|^production$/i.test(this.env);
  },
});
