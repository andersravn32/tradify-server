module.exports = {
    apps : [{
      name: "tradify-server",
      script: "./dist/index.js",
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      }
    }]
  }