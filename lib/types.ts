export interface ShowDetails {
  showTitle: string
  showDate: string
  venue: "UCB Franklin" | "UCB Annex"
  showTime: string
  techRehearsalTime: string
  presaleTicketPrice: number
  doorTicketPrice: number
  liveStream: boolean
  producerEmail: string
}

export interface ConfirmationResult {
  emailGenerated: boolean
  calendarEventCreated: boolean
  driveFolderCreated: boolean
  driveFolderUrl?: string
  emailContent?: string
  errors?: string[]
}
