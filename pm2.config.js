module.exports = {
  apps: [
    {
      name: "Tradify.dk Server",
      script: "server.js.js",
      node_args: "-r dotenv/config",
    },
  ],
};
