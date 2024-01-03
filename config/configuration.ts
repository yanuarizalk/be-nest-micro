
export default () => ({
    port: { // sub app service port / address
        user: parseInt(process.env.USER_SERVICE_ADDRESS, 10) || 3001,
        auth: parseInt(process.env.AUTH_SERVICE_ADDRESS, 10) || 3002
    },
    database: {
        uri: process.env.DATABASE_URI ?? 'mongodb://localhost:27017'
    },
    broker: {
        
    },
    secrets: {
        jwt: process.env.SECRET_JWT ?? 'siomFgvp3490R583mfOpwcm3ir4mf'
    }
});