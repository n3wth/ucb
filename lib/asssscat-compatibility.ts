// Browser-local CRUD for ASSSSCAT performer compatibility preferences.
// Scoped to the current device/browser — same pattern as asssscat-performers.ts.

import type { CompatibilityMap, PerformerCompatibility } from "@/lib/types"

const STORAGE_KEY = "ucb.asssscat.compatibility"

function isCompatibilityEntry(value: unknown): value is PerformerCompatibility {
  if (typeof value !== "object" || value === null) return false
  const v = value as Record<string, unknown>
  return (
    Array.isArray(v.likes) &&
    v.likes.every((x: unknown) => typeof x === "string") &&
    Array.isArray(v.dislikes) &&
    v.dislikes.every((x: unknown) => typeof x === "string")
  )
}

export function loadCompatibility(): CompatibilityMap {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {}
    const result: CompatibilityMap = {}
    for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof key === "string" && isCompatibilityEntry(val)) {
        result[key] = {
          likes: [...new Set(val.likes.filter((x: string) => x.length > 0))],
          dislikes: [...new Set(val.dislikes.filter((x: string) => x.length > 0))],
        }
      }
    }
    return result
  } catch {
    return {}
  }
}

export function saveCompatibility(map: CompatibilityMap): CompatibilityMap {
  if (typeof window === "undefined") return map
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
  } catch {
    // Quota / privacy — silently drop.
  }
  return map
}

export function setPerformerCompatibility(
  map: CompatibilityMap,
  performerId: string,
  patch: Partial<PerformerCompatibility>,
): CompatibilityMap {
  const current = map[performerId] ?? { likes: [], dislikes: [] }
  const next: CompatibilityMap = {
    ...map,
    [performerId]: {
      likes: patch.likes !== undefined ? [...new Set(patch.likes)] : current.likes,
      dislikes: patch.dislikes !== undefined ? [...new Set(patch.dislikes)] : current.dislikes,
    },
  }
  return saveCompatibility(next)
}

export function removePerformerCompatibility(
  map: CompatibilityMap,
  performerId: string,
): CompatibilityMap {
  const next = { ...map }
  delete next[performerId]
  // Also scrub references to this performer from other entries.
  for (const id of Object.keys(next)) {
    next[id] = {
      likes: next[id].likes.filter((x) => x !== performerId),
      dislikes: next[id].dislikes.filter((x) => x !== performerId),
    }
  }
  return saveCompatibility(next)
}

// Returns the set of incompatible pairs (as [idA, idB] tuples) within a cast.
// A pair is incompatible if either performer lists the other as a dislike.
export function getIncompatiblePairs(
  castIds: string[],
  map: CompatibilityMap,
): [string, string][] {
  const pairs: [string, string][] = []
  for (let i = 0; i < castIds.length; i++) {
    for (let j = i + 1; j < castIds.length; j++) {
      const a = castIds[i]
      const b = castIds[j]
      const aEntry = map[a]
      const bEntry = map[b]
      if (aEntry?.dislikes.includes(b) || bEntry?.dislikes.includes(a)) {
        pairs.push([a, b])
      }
    }
  }
  return pairs
}

// Returns how many performers in the cast that a given performer likes.
export function likedCollaboratorCount(
  performerId: string,
  castIds: string[],
  map: CompatibilityMap,
): number {
  const entry = map[performerId]
  if (!entry) return 0
  return entry.likes.filter((id) => castIds.includes(id) && id !== performerId).length
}
