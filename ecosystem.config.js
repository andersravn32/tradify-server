module.exports = {
    apps : [{
      name: "tradify-server",
      script: "./dist/server.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }