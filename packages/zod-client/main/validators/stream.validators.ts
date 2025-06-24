import { z } from "zod";

const createStreamSchema = z.object({
    title: z.string().nonempty().min(6).max(200),
    youtubeVideoUrl: z.string().url().nonempty(),
    chatSlowMode: z.boolean(),
    about: z.string(),
    thumbnailUrl: z.string().optional(),
    isScheduled: z.boolean().default(false),
    scheduledTime: z.string().datetime().optional(),
    endInMin: z.number().min(10).optional(),
});

const createSubscriptionSchema = z.object({
    streamerId: z.number().nonnegative(),
});

export type CreateSubscriptionPayloadT = z.infer<
    typeof createSubscriptionSchema
>;

export type CreateStreamPayloadT = z.infer<typeof createStreamSchema>;

export { createStreamSchema, createSubscriptionSchema };
