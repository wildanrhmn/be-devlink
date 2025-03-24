export default () => ({
  port: process.env.PORT,
  database: {
    mongodbUri: process.env.MONGODB_URI,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN
  },
  frontend: {
    url: process.env.FRONTEND_URL
  }
});
