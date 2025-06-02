module.exports = {
    apps: [
        {
            name: "permit-service",
            cwd: "./apps/permit-service",
            script: "yarn start",
        },
        {
            name: "queue-worker",
            cwd: "./apps/queue-worker",
            script: "yarn start",
        },
        {
            name: "server",
            cwd: "./apps/server",
            script: "yarn start",
            env: {
                PORT: 3005,
            },
        },
        {
            name: "server",
            cwd: "./apps/server",
            script: "yarn start",
            env: {
                PORT: 3006,
            },
        },
        {
            name: "server",
            cwd: "./apps/server",
            script: "yarn start",
            env: {
                PORT: 3007,
            },
        },
        // {
        //     name: "web",
        //     cwd: "./apps/web",
        //     script: "yarn dev --port 8082",
        // },
        // {
        //     name: "web",
        //     cwd: "./apps/web",
        //     script: "yarn dev --port 8083",
        // },
    ],
};
