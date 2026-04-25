// Browser-local CRUD for recurring ASSSSCAT performers.
// Scoped to the current device/browser — the app has a single shared staff
// login, so there is no server-side user identity to key off.

import {
  ASSSSCAT_PERFORMER_CATEGORIES,
  PERFORMER_GENDERS,
  PERFORMER_RACES,
  type AsssscatPerformer,
  type AsssscatPerformerCategory,
  type PerformerGender,
  type PerformerRace,
} from "@/lib/types"

const STORAGE_KEY = "ucb.asssscat.performers"
const SEEDED_KEY = "ucb.asssscat.performers.seeded"
export const MAX_PERFORMERS = 500
export const EMAIL_REGEX = /.+@.+\..+/

// Default performer roster sourced from Chris's contacts list.
// Performers with no known email have email: "" and are flagged in the UI.
// Category mapping: Wild Card → Wild Cards, Sub List → Subs.
export const DEFAULT_PERFORMERS: Omit<AsssscatPerformer, "id">[] = [
  // Core Cast
  { name: "Alex Fernie", email: "alfernie@gmail.com", category: "Core Cast" },
  { name: "Alex Song-Xia", email: "alexsongxia@gmail.com", category: "Core Cast" },
  { name: "Alexis Rhiannon", email: "alexis.rhiannon@gmail.com", category: "Core Cast" },
  { name: "Aman Adumer", email: "adumera@gmail.com", category: "Core Cast" },
  { name: "Betsy Sodaro", email: "betsysodaro@gmail.com", category: "Core Cast" },
  { name: "Brian Huskey", email: "brian.huskey@mac.com", category: "Core Cast" },
  { name: "Carl Tart", email: "carldtart@gmail.com", category: "Core Cast" },
  { name: "Chris Renfro", email: "christopher.a.renfro@gmail.com", category: "Core Cast" },
  { name: "Corin Wells", email: "charity.corin@gmail.com", category: "Core Cast" },
  { name: "Dave Theune", email: "theoutlawbiker@gmail.com", category: "Core Cast" },
  { name: "Devin Field", email: "thatdevinfield@gmail.com", category: "Core Cast" },
  { name: "Dhruv Uday Singh", email: "dhruvudaysingh@gmail.com", category: "Core Cast" },
  { name: "Echo Kellum", email: "darthecho@yahoo.com", category: "Core Cast" },
  { name: "Edgar Momplaisir", email: "edgar.momplaisir@gmail.com", category: "Core Cast" },
  { name: "Hillary Anne Matthews", email: "hillaryannematthews@gmail.com", category: "Core Cast" },
  { name: "Jacob Wysocki", email: "jacobwysocki@gmail.com", category: "Core Cast" },
  { name: "James Mannion", email: "jamespmannion@gmail.com", category: "Core Cast" },
  { name: "Jeremy Culhane", email: "jeremy.c.culhane@gmail.com", category: "Core Cast" },
  { name: "Joe Wengert", email: "joe.wengert@gmail.com", category: "Core Cast" },
  { name: "Jordan Myrick", email: "jordanmyr1ck@gmail.com", category: "Core Cast" },
  { name: "Kale Hills", email: "kale@ucbcomedy.com", category: "Core Cast" },
  { name: "Kimia Behpoornia", email: "kbehpoornia@gmail.com", category: "Core Cast" },
  { name: "Lou Wilson", email: "louwilzon@gmail.com", category: "Core Cast" },
  { name: "Mary Holland", email: "mholland85@gmail.com", category: "Core Cast" },
  { name: "Monique Moses", email: "monique.moses@gmail.com", category: "Core Cast" },
  { name: "Oscar Montoya", email: "monoscar@gmail.com", category: "Core Cast" },
  { name: "Owen Burke", email: "owenburke@me.com", category: "Core Cast" },
  { name: "Pam Murphy", email: "murphy.pam.m@gmail.com", category: "Core Cast" },
  { name: "Patrick McDonald", email: "patrick.f.mcdonald@gmail.com", category: "Core Cast" },
  { name: "Paul Welsh", email: "pb.welsh@gmail.com", category: "Core Cast" },
  { name: "Payam Banifaz", email: "peterbanifaz@gmail.com", category: "Core Cast" },
  { name: "Phil Jackson", email: "pjack12@gmail.com", category: "Core Cast" },
  { name: "Rachel Pegram", email: "rachel.a.pegram@gmail.com", category: "Core Cast" },
  { name: "Rekha Shankar", email: "rekhalshankar@gmail.com", category: "Core Cast" },
  { name: "Rob Huebel", email: "thisisrobhuebel@gmail.com", category: "Core Cast" },
  { name: "Ruha Taslimi", email: "ruhataslimi@gmail.com", category: "Core Cast" },
  { name: "Shaun Diston", email: "shaundiston@gmail.com", category: "Core Cast" },
  { name: "Suzi Barrett", email: "suzibarrett@gmail.com", category: "Core Cast" },
  { name: "Vic Michaelis", email: "vicmmic@gmail.com", category: "Core Cast" },
  { name: "Zac Oyama", email: "zatcheloyama@gmail.com", category: "Core Cast" },
  { name: "Zeke Nicholson", email: "isaaczekenicholson@gmail.com", category: "Core Cast" },
  // Wild Cards
  { name: "Alex Berg", email: "bergsandwich@gmail.com", category: "Wild Cards" },
  { name: "Allyn Pintal", email: "allynpintal@ucbcomedy.com", category: "Wild Cards" },
  { name: "Angela Giarratana", email: "angelagiarratana2@gmail.com", category: "Wild Cards" },
  { name: "Becky Drysdale", email: "rebeccadrysdale@me.com", category: "Wild Cards" },
  { name: "Beth Appel", email: "beth.appel@gmail.com", category: "Wild Cards" },
  { name: "Caroline Cotter", email: "caroline.cotter2@gmail.com", category: "Wild Cards" },
  { name: "Caroline Martin", email: "Caroline.Fiona.Martin@gmail.com", category: "Wild Cards" },
  { name: "Dan Gregor", email: "gregorda@gmail.com", category: "Wild Cards" },
  { name: "ER Fightmaster", email: "erfightmaster@gmail.com", category: "Wild Cards" },
  { name: "Heather Anne Campbell", email: "heather.anne.campbell@gmail.com", category: "Wild Cards" },
  { name: "Jacquis Neal", email: "jacquisneal@gmail.com", category: "Wild Cards" },
  { name: "James III", email: "james3rdcomedy@gmail.com", category: "Wild Cards" },
  { name: "Jerah Milligan", email: "jerah.milligan@gmail.com", category: "Wild Cards" },
  { name: "John Gemberling", email: "gemberloins@gmail.com", category: "Wild Cards" },
  { name: "Lauren Adams", email: "laurcadams@gmail.com", category: "Wild Cards" },
  { name: "Lyndsey Frank", email: "lyndseybfrank@gmail.com", category: "Wild Cards" },
  { name: "Mary Anthony", email: "maryeanthony1@gmail.com", category: "Wild Cards" },
  { name: "Monika Smith", email: "missmonikasmith@gmail.com", category: "Wild Cards" },
  { name: "Mookie Blaiklock", email: "mblaiklock@gmail.com", category: "Wild Cards" },
  { name: "Moujan Zolfaghari", email: "moujanz@gmail.com", category: "Wild Cards" },
  { name: "Nick Mandernach", email: "nicholasmandernach@gmail.com", category: "Wild Cards" },
  { name: "Ryan Barton", email: "ryanbarton15@gmail.com", category: "Wild Cards" },
  { name: "Toni Charline", email: "tonicharline@gmail.com", category: "Wild Cards" },
  { name: "Zach Reino", email: "zreino@gmail.com", category: "Wild Cards" },
  // Subs
  { name: "Nnamdi Ngwe", email: "nnamdingwe@gmail.com", category: "Subs" },
  { name: "Matt Newell", email: "matt.newell@ucbcomedy.com", category: "Subs" },
  { name: "Ify Nwadiwe", email: "inwadiwe@thatblacknerd.com", category: "Subs" },
  { name: "Carlos Santos", email: "CARLOS.SANTOSPR@gmail.com", category: "Subs" },
  { name: "Madeline Walter", email: "madeline.walter@gmail.com", category: "Subs" },
  { name: "Laura Chinn", email: "lauracchinn@gmail.com", category: "Subs" },
  { name: "Keisha Zollar", email: "KeishaZollar@gmail.com", category: "Subs" },
  { name: "Mano Agapion", email: "manoagapion@gmail.com", category: "Subs" },
  { name: "Nina Concepcion", email: "ninamconcepcion@gmail.com", category: "Subs" },
  { name: "Will Hines", email: "whines@gmail.com", category: "Subs" },
  { name: "Ryan Rosenberg", email: "ryanarosenberg@gmail.com", category: "Subs" },
  { name: "Ronnie Adrian", email: "ronnieadriancom@gmail.com", category: "Subs" },
  { name: "Marcy Jarreau", email: "marcylane@gmail.com", category: "Subs" },
  { name: "Sean Conroy", email: "swarmsean@gmail.com", category: "Subs" },
  { name: "Casey Feigh", email: "caseyfeigh@gmail.com", category: "Subs" },
  { name: "Dan Lippert", email: "dan.lippert@gmail.com", category: "Subs" },
  { name: "Jessica McKenna", email: "jessimcca@gmail.com", category: "Subs" },
  { name: "Ally Beardsley", email: "allybeardsley@gmail.com", category: "Subs" },
  { name: "Ali Ghandour", email: "aghandour@gmail.com", category: "Subs" },
  { name: "Alison Rich", email: "alison.h.rich@gmail.com", category: "Subs" },
  { name: "Anne Lane", email: "annelouiselane@gmail.com", category: "Subs" },
  { name: "Don Fanelli", email: "fadonz@gmail.com", category: "Subs" },
  { name: "Frank Garcia-Hejl", email: "frankgarciahejl@gmail.com", category: "Subs" },
  { name: "Greg Hess", email: "greghess@gmail.com", category: "Subs" },
  { name: "Holly Laurent", email: "hclaurent@gmail.com", category: "Subs" },
  { name: "James Mastraieni", email: "james.mastraieni@gmail.com", category: "Subs" },
  { name: "Jean Villepique", email: "thejeanmachine@mac.com", category: "Subs" },
  { name: "Jen D'Angelo", email: "jsdangelo@gmail.com", category: "Subs" },
  { name: "Jessica Elaina Eason", email: "jesspatsox@gmail.com", category: "Subs" },
  { name: "Jiavani", email: "jiavani.linayao@gmail.com", category: "Subs" },
  { name: "Julia Meltzer", email: "juliaburttmeltzer@gmail.com", category: "Subs" },
  { name: "Gilli Nissim", email: "gilli.nissim@gmail.com", category: "Subs" },
  { name: "Londale Theus Jr", email: "lmtboogie@gmail.com", category: "Subs" },
  { name: "Matt Apodaca", email: "mattapodaca@gmail.com", category: "Subs" },
  { name: "Sarah Claspell", email: "sarahbc@gmail.com", category: "Subs" },
  { name: "Seth Morris", email: "sethismorris@gmail.com", category: "Subs" },
  { name: "Talia Tabin", email: "talia.tabin@gmail.com", category: "Subs" },
  { name: "Victoria Longwell", email: "val5008@gmail.com", category: "Subs" },
  // Drop-Ins
  { name: "Laci Mosley", email: "lacirisemosley@gmail.com", category: "Drop-Ins" },
  { name: "Lisa Gilroy", email: "lisa.m.gilroy@gmail.com", category: "Drop-Ins" },
  { name: "Lauren Lapkus", email: "lauren.lapkus@gmail.com", category: "Drop-Ins" },
  { name: "Andy Daly", email: "andrewdaly@me.com", category: "Drop-Ins" },
  { name: "Anthony King", email: "theanthonyking@gmail.com", category: "Drop-Ins" },
  { name: "Arden Myrin", email: "ardenmyrin@gmail.com", category: "Drop-Ins" },
  { name: "Bobby Moynihan", email: "moynihan19@gmail.com", category: "Drop-Ins" },
  { name: "Brandon Scott Jones", email: "jones.brandonscott@gmail.com", category: "Drop-Ins" },
  { name: "Brennan Lee Mulligan", email: "brennanleemulligan@gmail.com", category: "Drop-Ins" },
  { name: "Colton Dunn", email: "colton.dunn@gmail.com", category: "Drop-Ins" },
  { name: "Connor Ratliff", email: "connorratliff@gmail.com", category: "Drop-Ins" },
  { name: "D'Arcy Carden", email: "darcycarden@gmail.com", category: "Drop-Ins" },
  { name: "Drew Tarver", email: "drew.tarver@gmail.com", category: "Drop-Ins" },
  { name: "Edi Patterson", email: "", category: "Drop-Ins" },
  { name: "Ego Nwodim", email: "eknwodim@gmail.com", category: "Drop-Ins" },
  { name: "Eugene Cordero", email: "ecorderoiv@gmail.com", category: "Drop-Ins" },
  { name: "Fran Gillespie", email: "gillespie.fran@gmail.com", category: "Drop-Ins" },
  { name: "Gil Ozeri", email: "gilozeri@gmail.com", category: "Drop-Ins" },
  { name: "Ian Brennan", email: "iancbrennan@yahoo.com", category: "Drop-Ins" },
  { name: "Ian Roberts", email: "baganga@aol.com", category: "Drop-Ins" },
  { name: "Jon Daly", email: "joncdaly@gmail.com", category: "Drop-Ins" },
  { name: "Jason Mantzoukas", email: "jmantzoukas@gmail.com", category: "Drop-Ins" },
  { name: "Jon Gabrus", email: "gabrus@gmail.com", category: "Drop-Ins" },
  { name: "Katie Dippold", email: "katiedippold@gmail.com", category: "Drop-Ins" },
  { name: "Kirby Howell-Baptiste", email: "kirbyhowellbaptiste@gmail.com", category: "Drop-Ins" },
  { name: "Lennon Parham", email: "lparham10@gmail.com", category: "Drop-Ins" },
  { name: "Lily Sullivan", email: "lilycsullivan@gmail.com", category: "Drop-Ins" },
  { name: "Matt Besser", email: "mattbesser67@gmail.com", category: "Drop-Ins" },
  { name: "Matt Walsh", email: "ucbwalshy@aol.com", category: "Drop-Ins" },
  { name: "Mike Mitchell", email: "mmitc47579@aol.com", category: "Drop-Ins" },
  { name: "Mike O'Brien", email: "", category: "Drop-Ins" },
  { name: "Neil Campbell", email: "nbcampbell@gmail.com", category: "Drop-Ins" },
  { name: "Neil Casey", email: "notneilcasey@mac.com", category: "Drop-Ins" },
  { name: "Nicole Byer", email: "nicolebyer@gmail.com", category: "Drop-Ins" },
  { name: "Nicole Parker", email: "nicoleparkerredford@gmail.com", category: "Drop-Ins" },
  { name: "Paul Rust", email: "paul.rust@gmail.com", category: "Drop-Ins" },
  { name: "Paul Scheer", email: "paulisnotajerk@me.com", category: "Drop-Ins" },
  { name: "Paul F. Tompkins", email: "chalkstripe@gmail.com", category: "Drop-Ins" },
  { name: "Sasheer Zamata", email: "sasheer1@gmail.com", category: "Drop-Ins" },
  { name: "Stephanie Allynne", email: "stephanieallynne@gmail.com", category: "Drop-Ins" },
  { name: "Sudi Green", email: "", category: "Drop-Ins" },
  { name: "Tawny Newsome", email: "", category: "Drop-Ins" },
  { name: "Tim Baltz", email: "btimothee1111@gmail.com", category: "Drop-Ins" },
  { name: "Zach Woods", email: "zachwoods55@yahoo.com", category: "Drop-Ins" },
  // Test Group
  { name: "Andres Parada", email: "andresparadacomedy@gmail.com", category: "Test Group" },
  { name: "Anna Garcia", email: "annalynnegarcia@gmail.com", category: "Test Group" },
  { name: "Anna Rajo", email: "anna.rajomiller@gmail.com", category: "Test Group" },
  { name: "Chad Westbrook", email: "cmwestbrook22@gmail.com", category: "Test Group" },
  { name: "Chris Tcholakian", email: "", category: "Test Group" },
  { name: "Collin McGurk", email: "", category: "Test Group" },
  { name: "DJ Mausner", email: "mausnerdj@gmail.com", category: "Test Group" },
  { name: "Eli Gonzalez", email: "eli.j.gonzalez@gmail.com", category: "Test Group" },
  { name: "Greg Roman", email: "ghr.greg@gmail.com", category: "Test Group" },
  { name: "Jack Brown", email: "brown7790jjb@gmail.com", category: "Test Group" },
  { name: "James Jellin", email: "", category: "Test Group" },
  { name: "Joe Fahey", email: "joefaheycomedy@gmail.com", category: "Test Group" },
  { name: "Josh Brekhus", email: "joshbrekhus@gmail.com", category: "Test Group" },
  { name: "Lauren Holt", email: "leholt312@gmail.com", category: "Test Group" },
  { name: "Lilan Bowden", email: "lilan.bowden@gmail.com", category: "Test Group" },
  { name: "Mia Schauffler", email: "mia.schauffler@gmail.com", category: "Test Group" },
  { name: "Molly Kiernan", email: "mollybkiernan@gmail.com", category: "Test Group" },
  { name: "PJ McCormick", email: "pj.mccormick@icloud.com", category: "Test Group" },
  { name: "Quinn Boyes", email: "qboyes@gmail.com", category: "Test Group" },
  { name: "Sean Smith", email: "seansean213@gmail.com", category: "Test Group" },
  { name: "Waleed Mansour", email: "waleedkmansour@gmail.com", category: "Test Group" },
]

export function isValidEmail(raw: string): boolean {
  const v = raw.trim()
  return v.length > 0 && EMAIL_REGEX.test(v)
}

function isCategory(value: unknown): value is AsssscatPerformerCategory {
  return (
    typeof value === "string" &&
    (ASSSSCAT_PERFORMER_CATEGORIES as readonly string[]).includes(value)
  )
}

function isGender(value: unknown): value is PerformerGender {
  return typeof value === "string" && (PERFORMER_GENDERS as readonly string[]).includes(value)
}

function isRace(value: unknown): value is PerformerRace {
  return typeof value === "string" && (PERFORMER_RACES as readonly string[]).includes(value)
}

function isPerformer(value: unknown): value is AsssscatPerformer {
  if (typeof value !== "object" || value === null) return false
  const p = value as Record<string, unknown>
  return (
    typeof p.id === "string" &&
    p.id.length > 0 &&
    typeof p.name === "string" &&
    p.name.trim().length > 0 &&
    typeof p.email === "string" &&
    (p.email === "" || isValidEmail(p.email)) &&
    isCategory(p.category) &&
    (p.additionalEmail === undefined || typeof p.additionalEmail === "string") &&
    (p.phone === undefined || typeof p.phone === "string") &&
    (p.gender === undefined || isGender(p.gender)) &&
    (p.race === undefined || isRace(p.race)) &&
    (p.lgbtq === undefined || typeof p.lgbtq === "boolean") &&
    (p.bookingCount === undefined || typeof p.bookingCount === "number")
  )
}

export function newPerformerId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID()
  }
  return `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function loadPerformers(): AsssscatPerformer[] {
  if (typeof window === "undefined") return []
  try {
    const alreadySeeded = window.localStorage.getItem(SEEDED_KEY)
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!alreadySeeded) {
      // First load after seed deployment: merge defaults into any existing data.
      // Existing entries win on dedup so user edits are preserved.
      const existing = raw ? (() => {
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(isPerformer) : []
      })() : []
      return seedDefaultPerformers(existing)
    }
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    const valid = parsed.filter(isPerformer).slice(0, MAX_PERFORMERS)
    return dedupePerformers(valid)
  } catch {
    return []
  }
}

function seedDefaultPerformers(existing: AsssscatPerformer[] = []): AsssscatPerformer[] {
  const defaults = DEFAULT_PERFORMERS.map((p) => ({ ...p, id: newPerformerId() }))
  // Existing entries are listed first so they win dedup (preserves user edits).
  const cleaned = dedupePerformers([...existing, ...defaults].filter(isPerformer)).slice(0, MAX_PERFORMERS)
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    window.localStorage.setItem(SEEDED_KEY, "1")
  } catch {
    // Quota or privacy mode — still return the in-memory list.
  }
  return cleaned
}

export function savePerformers(list: AsssscatPerformer[]): AsssscatPerformer[] {
  const cleaned = dedupePerformers(list.filter(isPerformer)).slice(0, MAX_PERFORMERS)
  if (typeof window === "undefined") return cleaned
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleaned))
    window.localStorage.setItem(SEEDED_KEY, "1")
  } catch {
    // Quota or privacy mode — silently drop. In-memory state still works.
  }
  return cleaned
}

// De-duplicate by lowercased email; for no-email entries, deduplicate by lowercased name.
export function dedupePerformers(list: AsssscatPerformer[]): AsssscatPerformer[] {
  const seen = new Set<string>()
  const out: AsssscatPerformer[] = []
  for (const p of list) {
    const email = p.email.trim()
    const key = email ? `email:${email.toLowerCase()}` : `name:${p.name.trim().toLowerCase()}`
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...p, name: p.name.trim(), email })
  }
  return out
}

export function addPerformer(
  list: AsssscatPerformer[],
  input: Omit<AsssscatPerformer, "id"> & { id?: string },
): AsssscatPerformer[] {
  const record: AsssscatPerformer = {
    ...input,
    id: input.id ?? newPerformerId(),
    name: input.name.trim(),
    email: input.email.trim(),
    category: input.category,
  }
  if (!isPerformer(record)) return list
  return dedupePerformers([...list.filter((p) => p.id !== record.id), record])
}

export function updatePerformer(
  list: AsssscatPerformer[],
  id: string,
  patch: Partial<Omit<AsssscatPerformer, "id">>,
): AsssscatPerformer[] {
  return list.map((p) => {
    if (p.id !== id) return p
    const next: AsssscatPerformer = {
      ...p,
      ...patch,
      id: p.id,
      name: (patch.name ?? p.name).trim(),
      email: (patch.email ?? p.email).trim(),
    }
    return isPerformer(next) ? next : p
  })
}

export function removePerformer(list: AsssscatPerformer[], id: string): AsssscatPerformer[] {
  return list.filter((p) => p.id !== id)
}

export interface NameMatchResult {
  input: string
  matched: AsssscatPerformer | null
}

export function parseCastInput(raw: string): string[] {
  return raw
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function matchPerformersByName(
  inputs: string[],
  performers: AsssscatPerformer[],
): NameMatchResult[] {
  return inputs.map((input) => {
    const needle = input.toLowerCase()
    const exact = performers.find((p) => p.name.toLowerCase() === needle)
    if (exact) return { input, matched: exact }
    const partial = performers.find((p) => p.name.toLowerCase().includes(needle) || needle.includes(p.name.toLowerCase()))
    return { input, matched: partial ?? null }
  })
}

export function groupByCategory(
  list: AsssscatPerformer[],
): Record<AsssscatPerformerCategory, AsssscatPerformer[]> {
  const groups = Object.fromEntries(
    ASSSSCAT_PERFORMER_CATEGORIES.map((c) => [c, [] as AsssscatPerformer[]]),
  ) as Record<AsssscatPerformerCategory, AsssscatPerformer[]>
  for (const p of list) {
    groups[p.category].push(p)
  }
  for (const c of ASSSSCAT_PERFORMER_CATEGORIES) {
    groups[c].sort((a, b) => a.name.localeCompare(b.name))
  }
  return groups
}

// Increment bookingCount for each performer in the given ID set, then save.
export function incrementBookingCounts(
  list: AsssscatPerformer[],
  bookedIds: string[],
): AsssscatPerformer[] {
  const idSet = new Set(bookedIds)
  const updated = list.map((p) =>
    idSet.has(p.id) ? { ...p, bookingCount: (p.bookingCount ?? 0) + 1 } : p,
  )
  return savePerformers(updated)
}
