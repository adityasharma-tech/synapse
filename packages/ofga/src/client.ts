import { env } from "@pkgs/zod-client";
import { CredentialsMethod, OpenFgaClient } from "@openfga/sdk";

const openFga = new OpenFgaClient({
    apiUrl: env.FGA_API_URL, // required, e.g. https://api.fga.example
    storeId: env.FGA_STORE_ID, // optional, not needed for \`CreateStore\` and \`ListStores\`, required before calling for all other methods
    authorizationModelId: env.FGA_MODEL_ID, // optional, can be overridden per request
    credentials: {
        method: CredentialsMethod.ClientCredentials,
        config: {
            apiTokenIssuer: env.FGA_API_TOKEN_ISSUER,
            apiAudience: env.FGA_API_AUDIENCE,
            clientId: env.FGA_CLIENT_ID,
            clientSecret: env.FGA_CLIENT_SECRET,
        },
    },
});

export { openFga };

/*
    model
    schema 1.1

    type user

    type group
    relations
    define member: [user]

    type folder
    relations
    define can_create_file: owner
    define owner: [user]
    define parent: [folder]
    define viewer: [user, user:*, group#member] or owner or viewer from parent

    type doc
    relations
    define can_change_owner: owner
    define owner: [user]
    define parent: [folder]
    define can_read: viewer or owner or viewer from parent
    define can_share: owner or owner from parent
    define viewer: [user, user:*, group#member]
    define can_write: owner or owner from parent
*/
