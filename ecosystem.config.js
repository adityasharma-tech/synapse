module.exports = {
    apps: [
        {
            name: "permit-service",
            cwd: "./apps/permit-service",
            script: "yarn start",
            // args: "start",
        },
        {
            name: "queue-worker",
            cwd: "./apps/queue-worker",
            script: "yarn start",
            // args: "start",
        },
        {
            name: "server",
            cwd: "./apps/server",
            script: "yarn start",
            // args: "
        },
        {
            name: "web",
            cwd: "./apps/web",
            script: "yarn dev",
            // args: "
        },
    ],
};
