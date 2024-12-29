module.exports = {
  apps: [
    {
      name: "kanbased",
      script: "pnpm",
      args: "start",
      instances: 1, // Number of instances (1 for a single instance)
      autorestart: true, // Automatically restart app on crash or changes
      watch: false, // Disable watch mode (optional for production)
      max_memory_restart: "3G", // Restart the app if it exceeds 1GB of memory usage
      error_file: "logs/err.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm Z",
    },
  ],
};
