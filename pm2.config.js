module.exports = {
  apps : [
      {
        name: "zhuo-zhu-api",
        script: "./app.js",
        watch: true,
        env: {
            "NODE_API_MODE": "PRODUCTION"
        }
      }
  ]
}