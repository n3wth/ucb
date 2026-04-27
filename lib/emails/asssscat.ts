import { formatDate } from "@/lib/format"
import type { AsssscatShowDetails } from "@/lib/types"

export interface AsssscatEmailOverrides {
  callTime?: string
  arrivalTime?: string
  contactPhone?: string
  compsEmail?: string
  venue?: string
  signature?: string
}

export interface AsssscatEmailInput {
  showDetails: AsssscatShowDetails
  overrides?: AsssscatEmailOverrides
}

export const ASSSSCAT_TO = "chris.renfro@ucbcomedy.com"
export const ASSSSCAT_VENUE = "UCB Franklin Theatre, 5919 Franklin Ave, Los Angeles, CA 90028"
export const ASSSSCAT_CONTACT_PHONE = "(646) 320-2922"
export const ASSSSCAT_CALL_TIME = "8:30PM"
export const ASSSSCAT_ARRIVAL_TIME = "8:15PM"
export const ASSSSCAT_COMPS_EMAIL = "lacomps@ucbcomedy.com"
export const ASSSSCAT_SIGNATURE = "Chris Renfro, Artistic Director"
export const ASSSSCAT_SMALL_CAST_THRESHOLD = 6

function pick(override: string | undefined, fallback: string): string {
  const trimmed = override?.trim()
  return trimmed && trimmed.length > 0 ? trimmed : fallback
}

export function renderAsssscatSubject(showDetails: AsssscatShowDetails): string {
  const date = showDetails.showDate ? formatDate(showDetails.showDate) : "TBD"
  return `ASSSSCAT cast booking — ${date}`
}

function formatMonologist(monologist: AsssscatShowDetails["monologist"]): string {
  const name = monologist.name.trim()
  const link = monologist.link.trim()
  const credits = monologist.credits.trim()
  if (!name) return "TBD"
  const nameLine = link ? `${name} (${link})` : name
  return credits ? `${nameLine} — ${credits}` : nameLine
}

export function renderAsssscatBody({ showDetails, overrides }: AsssscatEmailInput): string {
  const formattedDate = showDetails.showDate ? formatDate(showDetails.showDate) : "TBD"

  const callTime = pick(overrides?.callTime, ASSSSCAT_CALL_TIME)
  const arrivalTime = pick(overrides?.arrivalTime, ASSSSCAT_ARRIVAL_TIME)
  const contactPhone = pick(overrides?.contactPhone, ASSSSCAT_CONTACT_PHONE)
  const compsEmail = pick(overrides?.compsEmail, ASSSSCAT_COMPS_EMAIL)
  const venue = pick(overrides?.venue, ASSSSCAT_VENUE)
  const signature = overrides?.signature?.trim() ?? ""

  const castLines = showDetails.improvisers
    .map((performer, i) => `${i + 1}. ${performer.name}`)
    .join("\n")

  const ticketLink = showDetails.ticketLink.trim() || "TBD"

  const closing = signature ? `\n\n${signature}` : ""

  return `Hello everybody--

Excited to have you for ASSSSCAT on ${formattedDate}! The show begins at ${callTime}, please arrive no later than ${arrivalTime}. If you are running late or your availability changes, please let me know as soon as possible. Should you need to get ahold of me, my number is ${contactPhone}.

CAST
${castLines}

MONOLOGIST
${formatMonologist(showDetails.monologist)}

TICKET LINK
${ticketLink}
For comps, please email ${compsEmail}.

VENUE
${venue}

REMINDERS
- Show is 1.5hrs with no intermission.
- Expect 3-4 monologues from the monologist throughout.
- You call your own show — trust your instincts.
- If you need to cancel, please reply or text me as soon as possible.
- Valet is available at Schwartz and Sandy's Wednesday through Sunday.${closing}`
}
