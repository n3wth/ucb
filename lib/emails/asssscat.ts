import { formatDate } from "@/lib/format"
import type { AsssscatShowDetails } from "@/lib/types"

export interface AsssscatEmailInput {
  showDetails: AsssscatShowDetails
}

export const ASSSSCAT_TO = "chris.renfro@ucbcomedy.com"
export const ASSSSCAT_VENUE = "UCB Franklin Theatre, 5919 Franklin Ave, Los Angeles, CA 90028"
export const ASSSSCAT_CONTACT_PHONE = "(646) 320-2922"
export const ASSSSCAT_CALL_TIME = "8:30PM"
export const ASSSSCAT_ARRIVAL_TIME = "8:15PM"
export const ASSSSCAT_COMPS_EMAIL = "lacomps@ucbcomedy.com"
export const ASSSSCAT_SIGNATURE = "Chris Renfro, Artistic Director"
export const ASSSSCAT_MAX_IMPROVISERS = 8
export const ASSSSCAT_SMALL_CAST_THRESHOLD = 6

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

export function renderAsssscatBody({ showDetails }: AsssscatEmailInput): string {
  const formattedDate = showDetails.showDate ? formatDate(showDetails.showDate) : "TBD"

  const castLines = Array.from({ length: ASSSSCAT_MAX_IMPROVISERS }, (_, i) => {
    const performer = showDetails.improvisers[i]
    const label = `${i + 1}.`
    return performer ? `${label} ${performer.name}` : `${label}`
  }).join("\n")

  const ticketLink = showDetails.ticketLink.trim() || "TBD"

  return `Hello everybody--

Excited to have you for ASSSSCAT on ${formattedDate}! The show begins at ${ASSSSCAT_CALL_TIME}, please arrive no later than ${ASSSSCAT_ARRIVAL_TIME}. If you are running late or your availability changes, please let me know as soon as possible. Should you need to get ahold of me, my number is ${ASSSSCAT_CONTACT_PHONE}.

CAST
${castLines}

MONOLOGIST
${formatMonologist(showDetails.monologist)}

TICKET LINK
${ticketLink}
For comps, please email ${ASSSSCAT_COMPS_EMAIL}.

VENUE
${ASSSSCAT_VENUE}

REMINDERS
- Show is 1.5hrs with no intermission.
- The host makes the final call on show order at the top of the show.
- Expect 3-4 monologues from the monologist throughout.
- You call your own show — trust your instincts.
- If you need to cancel, please reply or text me as soon as possible.
- Valet is available at Schwartz and Sandy's Wednesday through Sunday.`
}
