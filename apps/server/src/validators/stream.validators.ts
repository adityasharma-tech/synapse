import { z } from "zod";

const createStreamSchema = z.object({
    title: z.string().nonempty().min(6).max(200),
    youtubeVideoUrl: z.string().url().nonempty(),
    chatSlowMode: z.boolean(),
    about: z.string().nonempty(),
    thumbnailUrl: z.string().optional(),
});

export { createStreamSchema };
