export interface DigitalTicket {
  enabled: boolean
  price: number
}

export interface ShowDetails {
  showTitle: string
  showDate: string
  venue: "UCB Franklin" | "UCB Annex"
  showTime: string
  durationMinutes: number
  techRehearsalTime: string
  techRehearsalDurationMinutes: number
  presaleTicketPrice: number
  doorTicketPrice: number
  digitalTicket: DigitalTicket
  producerEmail: string
  ccEmails: string[]
  bccEmails: string[]
}

export type StepStatus = "idle" | "pending" | "success" | "error"

export interface StepResult {
  status: StepStatus
  id?: string
  url?: string
  error?: string
}

export interface ConfirmationResult {
  email: StepResult
  calendarEvent: StepResult
  techCalendarEvent?: StepResult
  driveFolder: StepResult
}

export const ASSSSCAT_PERFORMER_CATEGORIES = [
  "Core Cast",
  "Wild Cards",
  "Subs",
  "Drop-Ins",
  "Test Group",
] as const
export type AsssscatPerformerCategory = (typeof ASSSSCAT_PERFORMER_CATEGORIES)[number]

export const PERFORMER_GENDERS = ["Male", "Female", "Non-Binary"] as const
export type PerformerGender = (typeof PERFORMER_GENDERS)[number]

export const PERFORMER_RACES = [
  "Black",
  "White",
  "Asian",
  "Native",
  "Latinx",
  "Middle Eastern",
  "Pacific Islander",
  "Multiracial",
] as const
export type PerformerRace = (typeof PERFORMER_RACES)[number]

export interface AsssscatPerformer {
  id: string
  name: string
  email: string
  category: AsssscatPerformerCategory
  additionalEmail?: string
  phone?: string
  gender?: PerformerGender
  races?: PerformerRace[]
  lgbtq?: boolean
  bookingCount?: number
}

// Compatibility preferences keyed by performer ID.
// likes: performer IDs this person enjoys working with (chip glows green in cast)
// dislikes: performer IDs this person does NOT want to work with (warning shown)
export interface PerformerCompatibility {
  likes: string[]
  dislikes: string[]
}

export type CompatibilityMap = Record<string, PerformerCompatibility>

export interface AsssscatMonologist {
  name: string
  link: string
  credits: string
}

export interface AsssscatShowDetails {
  showDate: string
  improvisers: AsssscatPerformer[]
  monologist: AsssscatMonologist
  ticketLink: string
  oneTimeCc: string[]
  defaultCc: string[]
  oneTimeBcc: string[]
}

export interface ShowListItem {
  id: string
  title: string
  startISO: string
  venue: string
  producer: string
  link: string
}

export interface ShowListResponse {
  shows: ShowListItem[]
}
