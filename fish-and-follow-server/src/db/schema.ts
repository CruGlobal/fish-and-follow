import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const RoleEnum = pgEnum('role_enum', ['admin', 'user']);

export const YearEnum = pgEnum('year_enum', [
  '1st_year',
  '2nd_year',
  '3rd_year',
  '4th_year',
  '5th_year',
  '6th_year',
  '7th_year',
  '8th_year',
  '9th_year',
  '10th_year',
  '11th_year',
]);

export const GenderEnum = pgEnum('gender_enum', ['male', 'female']);

export const user = pgTable('user', {
  id: uuid('id').primaryKey().defaultRandom(),
  role: RoleEnum('role').notNull(),
  username: varchar('username', { length: 255 }).notNull(), // e.g., 'admin', 'staff', 'student'
  email: varchar('email', { length: 255 }).notNull(),
  contactId: uuid('contact').references(() => contact.id),
});

export const userSessions = pgTable('user_sessions', {
  sid: text('sid').primaryKey(),
  sess: json('sess').notNull(),
  expire: timestamp('expire', { precision: 6 }).notNull(),
});

// contact table
export const contact = pgTable('contact', {
  id: uuid('id').primaryKey().defaultRandom(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  lastName: varchar('last_name', { length: 255 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  campus: varchar('campus', { length: 255 }).notNull(),
  major: varchar('major', { length: 255 }).notNull(),
  year: YearEnum('year').notNull(),
  isInterested: boolean('is_interested').notNull(),
  gender: GenderEnum('gender').notNull(),

  followUpStatusNumber: integer('follow_up_status').references(() => followUpStatus.number),
});

export const followUpStatus = pgTable('follow_up_status', {
  number: integer('number').primaryKey(),
  description: varchar('description', { length: 255 }).notNull(),
});

// Define relations
export const userRelations = relations(user, ({ one }) => ({
  contact: one(contact, {
    fields: [user.contactId],
    references: [contact.id],
  }),
}));

export const contactsRelations = relations(contact, ({ one, many }) => ({
  followUpStatus: many(followUpStatus),
}));

export const followUpStatusRelations = relations(followUpStatus, ({ one }) => ({
  contact: one(contact, {
    fields: [followUpStatus.number],
    references: [contact.followUpStatusNumber],
  }),
}));
