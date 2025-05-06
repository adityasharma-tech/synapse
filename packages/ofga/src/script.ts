import { openFga } from "./client";
import { logger } from "@pkgs/lib";

(async () => {
    const { authorization_model_id: id } =
        await openFga.writeAuthorizationModel({
            schema_version: "1.1",
            type_definitions: [
                {
                    type: "user",
                    relations: {
                        admin: {
                            this: {},
                        },
                        streamer: {
                            union: {
                                child: [
                                    {
                                        this: {},
                                    },
                                    {
                                        computedUserset: {
                                            relation: "admin",
                                        },
                                    },
                                ],
                            },
                        },
                        viewer: {
                            union: {
                                child: [
                                    {
                                        this: {},
                                    },
                                    {
                                        computedUserset: {
                                            relation: "streamer",
                                        },
                                    },
                                ],
                            },
                        },
                        can_create_stream: {
                            computedUserset: {
                                relation: "streamer",
                            },
                        },
                    },
                    metadata: {
                        relations: {
                            admin: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                    },
                                ],
                            },
                            streamer: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                    },
                                ],
                            },
                            viewer: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                    },
                                ],
                            },
                            can_create_stream: {
                                directly_related_user_types: [],
                            },
                        },
                    },
                },
                {
                    type: "stream",
                    relations: {
                        owner: {
                            this: {},
                        },
                        moderator: {
                            union: {
                                child: [
                                    {
                                        this: {},
                                    },
                                    {
                                        computedUserset: {
                                            relation: "owner",
                                        },
                                    },
                                ],
                            },
                        },
                        viewer: {
                            union: {
                                child: [
                                    {
                                        this: {},
                                    },
                                    {
                                        computedUserset: {
                                            relation: "moderator",
                                        },
                                    },
                                ],
                            },
                        },
                        can_view: {
                            computedUserset: {
                                relation: "viewer",
                            },
                        },
                        can_edit: {
                            computedUserset: {
                                relation: "moderator",
                            },
                        },
                        can_delete: {
                            computedUserset: {
                                relation: "owner",
                            },
                        },
                    },
                    metadata: {
                        relations: {
                            owner: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                        relation: "streamer",
                                    },
                                ],
                            },
                            moderator: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                    },
                                ],
                            },
                            viewer: {
                                directly_related_user_types: [
                                    {
                                        type: "user",
                                        wildcard: {},
                                    },
                                ],
                            },
                            can_view: {
                                directly_related_user_types: [],
                            },
                            can_edit: {
                                directly_related_user_types: [],
                            },
                            can_delete: {
                                directly_related_user_types: [],
                            },
                        },
                    },
                },
            ],
        });
    logger.info(`Authorization model updated successfully with code: ${id}`);
})();
