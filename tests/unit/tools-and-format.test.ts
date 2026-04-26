import { describe, it, expect } from "vitest"
import { getActiveToolByPathname, isPathUnderToolPath } from "@/lib/tools"
import { splitIsoDateTime } from "@/lib/format"

describe("isPathUnderToolPath", () => {
  it("matches exact and nested paths", () => {
    expect(isPathUnderToolPath("/tools/show-confirmation", "/tools/show-confirmation")).toBe(
      true,
    )
    expect(isPathUnderToolPath("/tools/show-confirmation/edit", "/tools/show-confirmation")).toBe(
      true,
    )
    expect(isPathUnderToolPath("/tools", "/tools/show-confirmation")).toBe(false)
  })
})

describe("getActiveToolByPathname", () => {
  it("picks the longest matching tool href for nested paths", () => {
    const t = getActiveToolByPathname("/tools/show-confirmation/foo")
    expect(t?.id).toBe("show-confirmation")
  })
})

describe("splitIsoDateTime", () => {
  it("splits full ISO and date-only", () => {
    expect(splitIsoDateTime("2025-06-01T19:30:00.000Z")).toEqual({
      date: "2025-06-01",
      time: "19:30",
    })
    expect(splitIsoDateTime("2025-06-01")).toEqual({ date: "2025-06-01", time: "" })
  })
})
