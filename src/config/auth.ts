export default {
  jwt: {
    secret: process.env.JWT_SECRET
      ? (process.env.JWT_SECRET as string)
      : "senhasupersecreta123",
    expiresIn: "1d",
  },
};
