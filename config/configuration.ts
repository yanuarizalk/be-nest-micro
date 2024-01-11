export default () => ({
  env: process.env.ENV ?? 'DEV',
  port: {
    // sub app service port / address
    user: parseInt(process.env.USER_SERVICE_ADDRESS, 10) || 3001,
    auth: parseInt(process.env.AUTH_SERVICE_ADDRESS, 10) || 3002,
    stream: parseInt(process.env.STREAM_SERVICE_ADDRESS, 10) || 3003,
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
  gateway: {
    // disconnect client websocket if they'r not pinged within configured interval, in second
    timeout: parseInt(process.env.GATEWAY_TIMEOUT, 10) || Number(300),
  },
  storage: {
    adapter: 'local', // | 'minio', 'aws-cloud'
    tempUpload: process.env.STORAGE_TEMP_UPLOAD ?? 'upload',
    profileImage: process.env.STORAGE_PROFILE_IMAGE ?? 'public/user/img',
    messageFile: process.env.STORAGE_MESSAGE_FILE ?? 'public/message',
  },
  inProduction: function (): boolean {
    return /^prod$|^production$/i.test(this.env);
  },
});
