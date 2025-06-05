import { z } from "zod";

const createStreamSchema = z.object({
    title: z.string().nonempty().min(6).max(200),
    youtubeVideoUrl: z.string().url().nonempty(),
    chatSlowMode: z.boolean(),
    about: z.string(),
    thumbnailUrl: z.string().optional(),
});

export type CreateStreamPayloadT = z.infer<typeof createStreamSchema>;

export { createStreamSchema };
