import { z } from "zod";

const loginSchema = z.object({
    username: z.string().nonempty(),
    email: z.string().email(),
    password: z
        .string()
        .min(8)
        .max(18)
        .regex(
            /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/
        ),
    metadata: z.object({
        platform: z.string().optional(),
        languages: z.array(z.string()).default([]).optional(),
        mobile: z.boolean().default(false).optional(),
        brands: z.array(
            z.object({
                brand: z.string(),
                version: z.string(),
            })
        ),
        deviceMemory: z.number().optional(),
    }),
});

export type LoginPayloadT = z.infer<typeof loginSchema>;

export { loginSchema };
