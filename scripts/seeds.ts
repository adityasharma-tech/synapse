import { DrizzleClient } from "@pkgs/drizzle-client/src/client";
import { Permissions, User } from "@pkgs/drizzle-client";
import bcrpyt from "bcryptjs";

const { db } = new DrizzleClient();

async () => {
    const passwordHash = bcrpyt.hashSync(
        process.env.ADMIN_PASSWORD!,
        bcrpyt.genSaltSync(10)
    );

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

    await db.insert(Permissions).values([
        {
            action: "*",
            resource: "chat",
            user: adminUser.id,
            createdAt: new Date(),
            effect: "allow",
        },
        {
            action: "*",
            resource: "order",
            user: adminUser.id,
            createdAt: new Date(),
            effect: "allow",
        },
        {
            action: "*",
            resource: "stream",
            user: adminUser.id,
            createdAt: new Date(),
            effect: "allow",
        },
        {
            action: "*",
            resource: "user",
            user: adminUser.id,
            createdAt: new Date(),
            effect: "allow",
        },
    ]);
};
