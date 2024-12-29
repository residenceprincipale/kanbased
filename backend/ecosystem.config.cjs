module.exports = {
  apps: [
    {
      name: "kanbased",
      script: "pnpm",
      args: "start",
      instances: 2, // Number of instances (1 for a single instance)
      exec_mode: "cluster",
    },
  ],
};
