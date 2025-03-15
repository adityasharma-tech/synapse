import * as t from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.sql";
import { User } from "./user.sql";

const Stream = t.pgTable('streams', {
  id: t.integer().primaryKey().generatedAlwaysAsIdentity(),
  streamTitle: t.varchar().notNull(),
  streamingToken: t.varchar().notNull(),
  streamerId: t.integer().references(()=>User.id).notNull(),
  ...timestamps
})

export {
  Stream
}


/**
 * create new stream
 * check if user is verified or not,
 * check if user is a streamer or viewer
 * verify user streamer token to check if user aadhar/pan/bank is verified or not
 * create a new stream in db with a new streaming token
 * createdBy: user
 */