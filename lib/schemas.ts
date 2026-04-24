import { z } from "zod"

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

export const techRehearsalEventSchema = z
  .object({
    enabled: z.boolean(),
    date: z.string(),
    time: z.string(),
    durationMinutes: z.number().int().positive().max(24 * 60),
  })
  .refine((v) => !v.enabled || (v.date.length > 0 && v.time.length > 0), {
    message: "techRehearsal date and time are required when enabled",
  })

export const confirmShowRequestSchema = z.object({
  showTitle: nonEmpty("showTitle"),
  showDate: nonEmpty("showDate"),
  showTime: nonEmpty("showTime"),
  venue: z.enum(["UCB Franklin", "UCB Annex"], {
    errorMap: () => ({ message: "venue is required" }),
  }),
  techRehearsalTime: z.string(),
  techRehearsal: techRehearsalEventSchema,
  presaleTicketPrice: z.number().finite().nonnegative(),
  doorTicketPrice: z.number().finite().nonnegative(),
  digitalTicket: digitalTicketSchema,
  producerEmail: emailLike,
  emailSubject: z.string().optional(),
  emailBody: z.string().optional(),
})

export type ConfirmShowRequest = z.infer<typeof confirmShowRequestSchema>
