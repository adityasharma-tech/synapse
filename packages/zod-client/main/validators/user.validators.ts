import { z } from "zod";

const createPaymentPlanSchema = z.object({
    planName: z.string().nonempty().min(3).max(30),
    planDetails: z.string().nonempty().min(5).max(200),
    inrAmountPerMonth: z.number().min(10).max(10000).nonnegative(),
});

const getChannelPlanDetailSchema = z.object({
    streamerId: z.coerce.number().nonnegative(),
});

export type CreatePlanPayloadT = z.infer<typeof createPaymentPlanSchema>;
export type GetChannelPlanDetailPayloadT = z.infer<
    typeof getChannelPlanDetailSchema
>;

export { createPaymentPlanSchema, getChannelPlanDetailSchema };
