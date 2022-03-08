module.exports = {
  openapi: "3.0.0",
  info: {
    title: "SMAPP API",
    description:
      "Full CRUD API for a social media app. Features: Users registration and authentication. Posts functionality, likes, comments etc.",
    version: "0.1.9",
  },
  paths: {
    "/api/auth": {
      get: {
        summary: "Get the authorized user with the user id.",
      },
      post: {
        summary: "Authenticate an user with an email and a password, and get a JWT token back.",
      },
    },
  },
};
