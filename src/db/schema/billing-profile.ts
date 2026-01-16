import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './user'

export const billingProfiles = pgTable(
  'billing_profile',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    country: text('country').notNull(),
    state: text('state').notNull(),
    city: text('city').notNull(),
    street: text('street').notNull(),
    zipcode: text('zipcode').notNull(),
    isBusinessCustomer: boolean('is_business_customer')
      .notNull()
      .default(false),
    taxId: text('tax_id'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('billing_profile_user_id_idx').on(table.userId),
    userIdUnique: uniqueIndex('billing_profile_user_id_unique').on(
      table.userId
    ),
    createdAtIdx: index('billing_profile_created_at_idx').on(table.createdAt),
  })
)
