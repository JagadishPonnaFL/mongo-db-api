module.exports = {
  apps: [
    {
      name: "api",
      script: "./server.js",
      instances: 1,
      exec_mode: "fork",
      env_production: {
        NODE_ENV: "production"
      },
      out_file: "/data/logs/api-out.log",
      error_file: "/data/logs/api-err.log",
      log_date_format: "YYYY-MM-DD HH:mm Z"
    }
  ]
}
