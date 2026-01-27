module.exports = {
    apps: [
      {
        name: "main", // The name of your PM2 process
        script: "./main.js", // The path to your main script
        interpreter: "/Users/vivekvs/.nvm/versions/node/v18.20.4/bin/node", // Path to Node.js version 18 (use the correct path)
        watch: true, // Enables watching for file changes
        env: {
          NODE_ENV: "development"
        },
        env_production: {
          NODE_ENV: "production"
        }
      }
    ]
  };
  