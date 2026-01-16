import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { users } from './user'

export const accountDeletionJobs = pgTable(
  'account_deletion_job',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('pending'),
    requestedAt: timestamp('requested_at', { mode: 'date' })
      .defaultNow()
      .notNull(),
    processedAt: timestamp('processed_at', { mode: 'date' }),
    error: text('error'),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('account_deletion_job_user_id_idx').on(table.userId),
    statusIdx: index('account_deletion_job_status_idx').on(table.status),
    requestedAtIdx: index('account_deletion_job_requested_at_idx').on(
      table.requestedAt
    ),
    userIdUnique: uniqueIndex('account_deletion_job_user_id_unique').on(
      table.userId
    ),
  })
)
