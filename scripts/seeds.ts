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
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "stream",
            action: "update",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "stream",
            action: "delete",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "stream",
            action: "block",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "user",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "user",
            action: "block",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "stream",
            action: "unblock",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "accept",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "reject",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "admin",
            resource: "streamer-requests",
            action: "user:block",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "stream",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:create",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:update:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "stream",
            action: "rating:delete:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "create",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "update:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "delete:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "upvote",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "user",
            resource: "chat",
            action: "downvote",
            resourceId: 0,
            targetId: 0,
        },
        //...
        {
            target: "streamer",
            resource: "stream",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:create",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:update:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "stream",
            action: "rating:delete:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "view",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "create",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "update:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "delete:own",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "upvote",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "downvote",
            resourceId: 0,
            targetId: 0,
        },
        {
            target: "streamer",
            resource: "chat",
            action: "delete",
            resourceId: 0,
            targetId: 0,
        },
    ]);
})();
