import { User } from "./user.sql";
import * as t from "drizzle-orm/pg-core";
import { schema, timestamps } from "./helpers.sql";

export const businessTypeEnum = schema.enum("business_type", [
  "llp",
  "ngo",
  "individual",
  "partnership",
  "proprietorship",
  "public_limited",
  "private_limited",
  "trust",
  "society",
  "not_yet_registered",
  "educational_institutes",
]);
export const requestStatusEnum = schema.enum("request_status", [
  "pending",
  "account_created",
  "stakeholder_created",
  "tnc_accepted",
  "account_added",
  "done",
]);

const StreamerRequest = schema.table("streamer_request", {
  id: t.integer().primaryKey().generatedByDefaultAsIdentity(),
  userId: t
    .integer()
    .references(() => User.id)
    .notNull(),
  razorpayAccountId: t.varchar({ length: 255 }),
  productConfigurationId: t.varchar({ length: 255 }),
  accountName: t.varchar().notNull(),
  accountEmail: t.varchar().notNull(),
  dashboardAccess: t.varchar().default("0").notNull(),
  customerRefunds: t.varchar().default("0").notNull(),
  businessName: t.varchar().notNull(),
  businessType: businessTypeEnum().default("individual").notNull(),
  requestStatus: requestStatusEnum().default("pending").notNull(),
  bankIfscCode: t.varchar().notNull(),
  bankAccountNumber: t.varchar().notNull(),
  phoneNumber: t.varchar().notNull(),
  streetAddress: t.varchar().notNull(),
  city: t.varchar().notNull(),
  state: t.varchar().notNull(),
  postalCode: t.varchar().notNull(),
  panCard: t.varchar().notNull(),
  ...timestamps,
});

export default StreamerRequest;
