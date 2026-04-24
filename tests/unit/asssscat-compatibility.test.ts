import { describe, it, expect, beforeEach } from 'vitest'
import {
  getIncompatiblePairs,
  likedCollaboratorCount,
  loadCompatibility,
  removePerformerCompatibility,
  saveCompatibility,
  setPerformerCompatibility,
} from '@/lib/asssscat-compatibility'
import type { CompatibilityMap } from '@/lib/types'

const STORAGE_KEY = 'ucb.asssscat.compatibility'

beforeEach(() => {
  window.localStorage.removeItem(STORAGE_KEY)
})

describe('loadCompatibility', () => {
  it('returns empty map when nothing stored', () => {
    expect(loadCompatibility()).toEqual({})
  })

  it('round-trips valid data', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['b'], dislikes: ['c'] },
      'b': { likes: [], dislikes: ['a'] },
    }
    saveCompatibility(map)
    expect(loadCompatibility()).toEqual(map)
  })

  it('ignores invalid stored JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{nope')
    expect(loadCompatibility()).toEqual({})
  })

  it('ignores non-object stored values', () => {
    window.localStorage.setItem(STORAGE_KEY, '"string"')
    expect(loadCompatibility()).toEqual({})
  })

  it('ignores entries with invalid structure', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'a': { likes: ['b'], dislikes: ['c'] },
      'bad': 'not an object',
    }))
    const result = loadCompatibility()
    expect(result['a']).toEqual({ likes: ['b'], dislikes: ['c'] })
    expect(result['bad']).toBeUndefined()
  })

  it('deduplicates IDs within likes and dislikes', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      'a': { likes: ['b', 'b', 'c'], dislikes: ['d', 'd'] },
    }))
    const result = loadCompatibility()
    expect(result['a'].likes).toEqual(['b', 'c'])
    expect(result['a'].dislikes).toEqual(['d'])
  })
})

describe('setPerformerCompatibility', () => {
  it('creates a new entry when none exists', () => {
    const map = setPerformerCompatibility({}, 'a', { likes: ['b'] })
    expect(map['a'].likes).toEqual(['b'])
    expect(map['a'].dislikes).toEqual([])
  })

  it('updates likes without touching dislikes', () => {
    const initial: CompatibilityMap = { 'a': { likes: [], dislikes: ['c'] } }
    const result = setPerformerCompatibility(initial, 'a', { likes: ['b'] })
    expect(result['a'].likes).toEqual(['b'])
    expect(result['a'].dislikes).toEqual(['c'])
  })

  it('deduplicates IDs', () => {
    const result = setPerformerCompatibility({}, 'a', { likes: ['b', 'b'] })
    expect(result['a'].likes).toEqual(['b'])
  })
})

describe('removePerformerCompatibility', () => {
  it('removes the performer entry', () => {
    const map: CompatibilityMap = { 'a': { likes: ['b'], dislikes: [] } }
    const result = removePerformerCompatibility(map, 'a')
    expect(result['a']).toBeUndefined()
  })

  it('scrubs references from other entries', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['b', 'c'], dislikes: [] },
      'b': { likes: [], dislikes: ['a', 'c'] },
    }
    const result = removePerformerCompatibility(map, 'a')
    expect(result['b'].dislikes).toEqual(['c'])
    expect(result['b'].likes).toEqual([])
  })
})

describe('getIncompatiblePairs', () => {
  it('returns empty array when no conflicts', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['b'], dislikes: [] },
      'b': { likes: ['a'], dislikes: [] },
    }
    expect(getIncompatiblePairs(['a', 'b'], map)).toEqual([])
  })

  it('detects A dislikes B', () => {
    const map: CompatibilityMap = {
      'a': { likes: [], dislikes: ['b'] },
      'b': { likes: [], dislikes: [] },
    }
    const pairs = getIncompatiblePairs(['a', 'b', 'c'], map)
    expect(pairs).toHaveLength(1)
    expect(pairs[0]).toContain('a')
    expect(pairs[0]).toContain('b')
  })

  it('detects B dislikes A (symmetric)', () => {
    const map: CompatibilityMap = {
      'a': { likes: [], dislikes: [] },
      'b': { likes: [], dislikes: ['a'] },
    }
    const pairs = getIncompatiblePairs(['a', 'b'], map)
    expect(pairs).toHaveLength(1)
  })

  it('does not double-count mutual dislikes', () => {
    const map: CompatibilityMap = {
      'a': { likes: [], dislikes: ['b'] },
      'b': { likes: [], dislikes: ['a'] },
    }
    expect(getIncompatiblePairs(['a', 'b'], map)).toHaveLength(1)
  })

  it('returns empty for cast members not in map', () => {
    expect(getIncompatiblePairs(['x', 'y'], {})).toEqual([])
  })
})

describe('likedCollaboratorCount', () => {
  it('returns 0 when performer has no likes', () => {
    expect(likedCollaboratorCount('a', ['b', 'c'], {})).toBe(0)
  })

  it('counts liked performers who are in the cast', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['b', 'c', 'd'], dislikes: [] },
    }
    // b and c are in cast, d is not
    expect(likedCollaboratorCount('a', ['a', 'b', 'c'], map)).toBe(2)
  })

  it('does not count self', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['a', 'b'], dislikes: [] },
    }
    expect(likedCollaboratorCount('a', ['a', 'b'], map)).toBe(1)
  })

  it('returns 0 when none of the liked performers are in cast', () => {
    const map: CompatibilityMap = {
      'a': { likes: ['x', 'y'], dislikes: [] },
    }
    expect(likedCollaboratorCount('a', ['a', 'b'], map)).toBe(0)
  })
})
