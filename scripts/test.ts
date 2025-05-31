import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { hasPermission } from "@pkgs/lib";

hasPermission({
    target: "admin:*",
    resource: "chat:*",
    action: "delete:own",
});
