import { z } from "zod"
import { MAX_SHOW_DURATION_MINUTES, MIN_SHOW_DURATION_MINUTES } from "@/lib/config"

const nonEmpty = (field: string) => z.string().trim().min(1, `${field} is required`)

// Matches the manual regex previously used in the route: /.+@.+\..+/
const emailLike = z
  .string()
  .trim()
  .min(1, "producerEmail is required")
  .regex(/.+@.+\..+/, "producerEmail is invalid")

export const digitalTicketSchema = z.object({
  enabled: z.boolean(),
  price: z.number().finite().nonnegative(),
})

export const confirmShowRequestSchema = z.object({
  showTitle: nonEmpty("showTitle"),
  showDate: nonEmpty("showDate"),
  showTime: nonEmpty("showTime"),
  venue: z.enum(["UCB Franklin", "UCB Annex"], {
    errorMap: () => ({ message: "venue is required" }),
  }),
  durationMinutes: z
    .number()
    .int("durationMinutes must be a whole number of minutes")
    .min(MIN_SHOW_DURATION_MINUTES, `durationMinutes must be at least ${MIN_SHOW_DURATION_MINUTES}`)
    .max(MAX_SHOW_DURATION_MINUTES, `durationMinutes must be at most ${MAX_SHOW_DURATION_MINUTES}`),
  techRehearsalTime: z.string(),
  presaleTicketPrice: z.number().finite().nonnegative(),
  doorTicketPrice: z.number().finite().nonnegative(),
  digitalTicket: digitalTicketSchema,
  producerEmail: emailLike,
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
})

export type ConfirmShowRequest = z.infer<typeof confirmShowRequestSchema>
