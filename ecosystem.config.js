module.exports = {
    apps: [
        {
            name: "permit-service-1",
            cwd: "./apps/permit-service",
            script: "yarn build && yarn start",
            env: {
                // PERMIT_GRPC_ADDRESS: "0.0.0.0:3010"
            },
        },
        // {
        //     name: "permit-service-2",
        //     cwd: "./apps/permit-service",
        //     script: "yarn start",
        //     env: {
        //         PERMIT_GRPC_ADDRESS: "0.0.0.0:3008"
        //     }
        // },
        // {
        //     name: "permit-service-3",
        //     cwd: "./apps/permit-service",
        //     script: "yarn start",
        //     env: {
        //         PERMIT_GRPC_ADDRESS: "0.0.0.0:3009"
        //     }
        // },
        {
            name: "queue-worker",
            cwd: "./apps/queue-worker",
            script: "yarn start",
        },
        // {
        //     name: "server-1",
        //     cwd: "./apps/server",
        //     script: "yarn start",
        //     env: {
        //         PORT: 5174,
        //     },
        // },
        // {
        //     name: "server-2",
        //     cwd: "./apps/server",
        //     script: "yarn start",
        //     env: {
        //         PORT: 3006,
        //     },
        // },
        // {
        //     name: "server-3",
        //     cwd: "./apps/server",
        //     script: "yarn start",
        //     env: {
        //         PORT: 3007,
        //     },
        // },
        {
            name: "web-dev",
            cwd: "./apps/web",
            script: "yarn dev",
        },
    ],
};
