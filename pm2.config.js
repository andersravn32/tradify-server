module.exports = {
  apps: [
    {
      name: "Tradify.dk Server",
      script: "server.js",
      node_args: "-r dotenv/config",
    },
  ],
};
