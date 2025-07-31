import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const RoleEnum = pgEnum('role_enum', ['admin', 'staff']);

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
  username: varchar('username', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  contactId: uuid('contact').references(() => contact.id),
});

export const organization = pgTable('organization', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    country: varchar('country', { length: 255 }).notNull(),
    strategy: varchar('strategy', { length: 255 }).notNull(),
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
  orgId: uuid('org_id').notNull().references(() => organization.id),
  notes: varchar('notes', { length: 2500 }).default('')
});

export const followUpStatus = pgTable('follow_up_status', {
  number: integer('number').primaryKey(),
  description: varchar('description', { length: 255 }).notNull(),
});

export const role = pgTable('role', {
    id: uuid('id').primaryKey().defaultRandom(),
    orgId: uuid('org_id').notNull().references(() => organization.id),
    userId: uuid('user_id').notNull().references(() => user.id),
    role: RoleEnum('role').notNull(), 
});


// Define relations
export const userRelations = relations(user, ({ one, many }) => ({
  contact: one(contact, {
    fields: [user.contactId],
    references: [contact.id],
  }),
  roles: many(role),
  organizations: many(organization),
}));

export const contactRelations = relations(contact, ({ one }) => ({
  followUpStatus: one(followUpStatus, {
    fields: [contact.followUpStatusNumber],
    references: [followUpStatus.number],
  }),
  organization: one(organization, {
    fields: [contact.orgId],
    references: [organization.id],
  }),
}));

export const followUpStatusRelations = relations(followUpStatus, ({ many }) => ({
  contacts: many(contact),
}));

export const organizationRelations = relations(organization, ({ many }) => ({
  roles: many(role),
  users: many(user),
  contacts: many(contact),
}));

export const roleRelations = relations(role, ({ one }) => ({
  organization: one(organization, {
    fields: [role.orgId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [role.userId],
    references: [user.id],
  }),
}));
