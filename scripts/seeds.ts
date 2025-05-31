import { config as dotenvConfig } from "dotenv";
dotenvConfig();
import { DrizzleClient } from "@pkgs/drizzle-client";
import { Permissions, User } from "@pkgs/drizzle-client";
import bcrpyt from "bcryptjs";

const { db } = new DrizzleClient();

(async () => {
    const passwordHash = bcrpyt.hashSync(
        process.env.ADMIN_PASSWORD!,
        bcrpyt.genSaltSync(10)
    );

    try {
        const [adminUser] = await db
            .insert(User)
            .values([
                {
                    email: "admin@admin.com",
                    firstName: "Admin",
                    lastName: "User",
                    passwordHash,
                    phoneNumber: "1234567890",
                    username: "imadmin",
                    createdAt: new Date(),
                    emailVerified: true,
                    lastLoginMethod: "email-password",
                    role: "admin",
                },
            ])
            .returning()
            .execute();

        if (!adminUser) throw new Error("Failed to create new user.");
    } catch (error) {
        // console.error(error);
    }

    await db.insert(Permissions).values([
        {
            target: "admin",
            resource: "stream",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "stream",
            action: "update",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "stream",
            action: "delete",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "stream",
            action: "block",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "stream",
            action: "unblock",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "user",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "user",
            action: "block",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "stream",
            action: "unblock",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "accept",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "reject",
            resourceId: null,
            targetId: null,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "user:block",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "stream",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:create",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:update:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:delete:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "create",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "update:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "delete:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "upvote",
            resourceId: null,
            targetId: null,
        },
        {
            target: "user",
            resource: "chat",
            action: "downvote",
            resourceId: null,
            targetId: null,
        },
        //...
        {
            target: "streamer",
            resource: "stream",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:create",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:update:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:delete:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "view",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "create",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "update:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "delete:own",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "upvote",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "downvote",
            resourceId: null,
            targetId: null,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "delete",
            resourceId: null,
            targetId: null,
        },
    ]);
})();
