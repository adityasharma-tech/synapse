import * as t from "drizzle-orm/pg-core";
import { User } from "./user.sql";
import { timestamps } from "./helpers.sql";

const businessType = t.pgEnum('businessType', ['llp', 'ngo', 'individual', 'partnership', 'proprietorship', 'public_limited', 'private_limited', 'trust', 'society', 'not_yet_registered', 'educational_institutes'])
const requestStatus = t.pgEnum('requestStatus', ['pending', 'processing' ,'accepted', 'done'])

const StreamerRequest = t.pgTable("streamer_request", {
  userId: t.integer().references(() => User.id).notNull(),
  accountName: t.varchar().notNull(),
  accountEmail: t.varchar().notNull(),
  dashboardAccess: t.varchar().default("0").notNull(),
  customerRefunds: t.varchar().default("1").notNull(),
  businessName: t.varchar().notNull(),
  businessType: businessType().default("individual").notNull(),
  requestStatus: requestStatus().default('pending').notNull(),
  bankIfscCode: t.varchar().notNull(),
  bankAccountNumber: t.varchar().notNull(),
  phoneNumber: t.varchar().notNull(),
  streetAddress: t.varchar().notNull(),
  city: t.varchar().notNull(),
  state: t.varchar().notNull(),
  postalCode: t.varchar().notNull(),
  ...timestamps,
});

export default StreamerRequest;