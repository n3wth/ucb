export interface DigitalTicket {
  enabled: boolean
  price: number
}

export interface TechRehearsalEvent {
  enabled: boolean
  date: string
  time: string
  durationMinutes: number
}

export interface ShowDetails {
  showTitle: string
  showDate: string
  venue: "UCB Franklin" | "UCB Annex"
  showTime: string
  techRehearsalTime: string
  techRehearsal: TechRehearsalEvent
  presaleTicketPrice: number
  doorTicketPrice: number
  digitalTicket: DigitalTicket
  producerEmail: string
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
  driveFolder: StepResult
  techRehearsalEvent?: StepResult
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
