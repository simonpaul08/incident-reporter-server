import { relations } from "drizzle-orm";
import { boolean, integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const typeEnum = pgEnum("type", ["individual", "government", "enterprise"])
export const priorityEnum = pgEnum("priority", ["high", "medium", "low"])
export const statusEnum = pgEnum("status", ["open", "in-progress", "closed"])

// users table
export const users = pgTable("users", {
    id: serial("id").primaryKey(),
    type: typeEnum().notNull().default("individual"),
    firstName: varchar("firstname", { length: 255 }).notNull(),
    lastName: varchar("lastname", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }),
    country: varchar('country', { length: 100 }),
    state: varchar('state', { length: 100 }),
    city: varchar('city', { length: 100 }),
    pincode: varchar('pincode', { length: 10 }),
    mobile: varchar("mobile", { length: 20 }).notNull(),
    fax: varchar("fax", { length: 20 }),
    phone: varchar("phone", { length: 20 }),
    password: varchar("password", { length: 255 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})

// incident table 
export const incident = pgTable("incident", {
    id: serial('id').primaryKey(),
    incident_id: varchar('incident_id', { length: 20 }).notNull().unique(),
    user_id: integer('user_id').notNull().references(() => users.id),
    reporter_name: varchar('reporter_name', { length: 255 }).notNull(),
    reporter_type: typeEnum().notNull().default("individual"),
    details: text('details').notNull(),
    priority: priorityEnum().notNull().default("low"),
    status: statusEnum().notNull().default("open"),
    date_reported: timestamp('date_reported').defaultNow(),
    is_editable: boolean('is_editable').default(true),
    updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
})


export const usersRelations = relations(users, 
    ({ many }) => ({
        incident: many(incident)
    })
)

export const incidentRelations = relations(incident, 
    ({ one }) => ({
        users: one(users, {
            fields: [incident.user_id],
            references: [users.id]
        })
    })
)