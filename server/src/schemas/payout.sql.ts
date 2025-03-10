import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Payout = t.pgTable('payouts', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: t.integer().references(()=>User.id),
  transferId: t.varchar().notNull(),
  cfTransferId: t.varchar().notNull(),
  status: t.varchar().notNull(),
  statusCode: t.varchar().notNull(),
  transferMode: t.varchar().notNull(),
  transferAmount: t.varchar().notNull(),
  transferServiceCharge: t.varchar(),
  transferServiceTax: t.varchar(),
  transferUtr: t.varchar(),
  ...timestamps
})

export {
  Payout
}