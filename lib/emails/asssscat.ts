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

  return `Hi all,

You're booked for ASSSSCAT on ${formattedDate}. Call time is ${ASSSSCAT_CALL_TIME} — please arrive by ${ASSSSCAT_ARRIVAL_TIME}. Day-of contact: ${ASSSSCAT_CONTACT_PHONE}.

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
- Arrive by ${ASSSSCAT_ARRIVAL_TIME}; call time is ${ASSSSCAT_CALL_TIME}.
- Reply-all if you have a conflict so we can line up a sub.
- Bring a backup shirt and anything you need for the run.

Thanks,
${ASSSSCAT_SIGNATURE}`
}
