import { describe, expect, test } from "bun:test"
import { buildImportedStoredData, mergeDateCells, parseContextStoredData, toStoredData } from "./persistence"
import { DateCellData } from "./colors"

describe("parseContextStoredData", () => {
  test("loads valid persisted state", () => {
    const raw = JSON.stringify({
      selectedYear: 2026,
      dateCells: {
        "2026-0-10": { customText: "Saved", color: "green" },
      },
      selectedColorTexture: "teal",
      selectedView: "Column",
    })

    const parsed = parseContextStoredData(raw, 2025)
    expect(parsed.selectedYear).toBe(2026)
    expect(parsed.selectedColorTexture).toBe("teal")
    expect(parsed.selectedView).toBe("Column")
    expect(parsed.dateCells?.get("2026-0-10")).toEqual({ customText: "Saved", color: "green" })
  })

  test("ignores invalid year, view and color texture", () => {
    const raw = JSON.stringify({
      selectedYear: 2035,
      dateCells: {},
      selectedColorTexture: "not-a-color",
      selectedView: "Grid",
    })

    const parsed = parseContextStoredData(raw, 2025)
    expect(parsed.selectedYear).toBeUndefined()
    expect(parsed.selectedColorTexture).toBeUndefined()
    expect(parsed.selectedView).toBeUndefined()
  })
})

describe("mergeDateCells", () => {
  test("merges imported date cells while preserving existing fields", () => {
    const current = new Map<string, DateCellData>([["2026-0-1", { customText: "existing", texture: "polka-dots" }]])
    const incoming = {
      "2026-0-1": { color: "green" },
      "2026-0-2": { customText: "new entry" },
    }

    const merged = mergeDateCells(current, incoming)
    expect(merged.get("2026-0-1")).toEqual({ customText: "existing", texture: "polka-dots", color: "green" })
    expect(merged.get("2026-0-2")).toEqual({ customText: "new entry" })
  })

  test("ignores non-object incoming payload", () => {
    const current = new Map<string, DateCellData>([["2026-0-1", { color: "blue" }]])
    const merged = mergeDateCells(current, "invalid")
    expect(merged).toEqual(current)
  })
})

describe("stored data builders", () => {
  test("toStoredData serializes map state", () => {
    const data = toStoredData(
      2026,
      new Map<string, DateCellData>([["2026-0-1", { customText: "task", color: "red" }]]),
      "teal",
      "Classic"
    )

    expect(data).toEqual({
      selectedYear: 2026,
      dateCells: { "2026-0-1": { customText: "task", color: "red" } },
      selectedColorTexture: "teal",
      selectedView: "Classic",
    })
  })

  test("buildImportedStoredData applies valid imports with fallback for invalid values", () => {
    const built = buildImportedStoredData(
      {
        selectedYear: 2027,
        selectedColorTexture: "bad-color",
        selectedView: "Column",
        dateCells: {
          "2026-0-1": { color: "orange" },
        },
      },
      {
        selectedYear: 2026,
        dateCells: new Map<string, DateCellData>([["2026-0-1", { customText: "existing" }]]),
        selectedColorTexture: "red",
        selectedView: "Linear",
      }
    )

    expect(built.selectedYear).toBe(2027)
    expect(built.selectedColorTexture).toBe("red")
    expect(built.selectedView).toBe("Column")
    expect(built.dateCells["2026-0-1"]).toEqual({ customText: "existing", color: "orange" })
  })
})
