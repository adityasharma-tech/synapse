import { z } from "zod";

const loginSchema = z.object({
    username: z.string(),
    email: z.string().email(),
    password: z.string().min(8).max(18).nonempty(),
    metadata: z.object({
        languages: z.array(z.string()).default([]).optional(),
    }),
});

export type LoginPayloadT = z.infer<typeof loginSchema>;

export { loginSchema };
