import { ALL_COLOR_TEXTURE_CODES, ColorTextureCode, DateCellData } from "./colors"

export type CalendarView = "Linear" | "Classic" | "Column"

export interface StoredData {
  selectedYear: number
  dateCells: Record<string, DateCellData>
  selectedColorTexture: ColorTextureCode
  selectedView: CalendarView
  version?: string
}

export const STORAGE_KEY = "calendar_data"

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return Boolean(value) && typeof value === "object"
}

export const isCalendarView = (value: unknown): value is CalendarView => {
  return value === "Linear" || value === "Classic" || value === "Column"
}

export const isColorTextureCode = (value: unknown): value is ColorTextureCode => {
  return typeof value === "string" && ALL_COLOR_TEXTURE_CODES.includes(value as ColorTextureCode)
}

export const parseContextStoredData = (
  rawData: string,
  currentYear: number
): {
  selectedYear?: number
  dateCells?: Map<string, DateCellData>
  selectedColorTexture?: ColorTextureCode
  selectedView?: CalendarView
} => {
  const parsedData = JSON.parse(rawData) as unknown
  if (!isRecord(parsedData)) {
    return {}
  }

  const loaded: {
    selectedYear?: number
    dateCells?: Map<string, DateCellData>
    selectedColorTexture?: ColorTextureCode
    selectedView?: CalendarView
  } = {}

  if (
    typeof parsedData.selectedYear === "number" &&
    parsedData.selectedYear >= currentYear - 1 &&
    parsedData.selectedYear <= currentYear + 5
  ) {
    loaded.selectedYear = parsedData.selectedYear
  }

  if (isRecord(parsedData.dateCells)) {
    loaded.dateCells = new Map(Object.entries(parsedData.dateCells as Record<string, DateCellData>))
  }

  if (isColorTextureCode(parsedData.selectedColorTexture)) {
    loaded.selectedColorTexture = parsedData.selectedColorTexture
  }

  if (isCalendarView(parsedData.selectedView)) {
    loaded.selectedView = parsedData.selectedView
  }

  return loaded
}

export const mergeDateCells = (
  currentDateCells: Map<string, DateCellData>,
  incomingDateCells: unknown
): Map<string, DateCellData> => {
  const merged = new Map(currentDateCells)
  if (!isRecord(incomingDateCells)) {
    return merged
  }

  Object.entries(incomingDateCells).forEach(([dateKey, cellData]) => {
    if (!isRecord(cellData)) return
    const existing = merged.get(dateKey) || {}
    merged.set(dateKey, {
      ...existing,
      ...(cellData as DateCellData),
    })
  })

  return merged
}

export const toStoredData = (
  selectedYear: number,
  dateCells: Map<string, DateCellData>,
  selectedColorTexture: ColorTextureCode,
  selectedView: CalendarView
): StoredData => {
  return {
    selectedYear,
    dateCells: Object.fromEntries(dateCells),
    selectedColorTexture,
    selectedView,
  }
}

export const buildImportedStoredData = (
  loadedData: unknown,
  currentState: {
    selectedYear: number
    dateCells: Map<string, DateCellData>
    selectedColorTexture: ColorTextureCode
    selectedView: CalendarView
  }
): StoredData => {
  const loadedRecord = isRecord(loadedData) ? loadedData : {}
  const mergedDateCells = mergeDateCells(currentState.dateCells, loadedRecord.dateCells)

  return {
    selectedYear: typeof loadedRecord.selectedYear === "number" ? loadedRecord.selectedYear : currentState.selectedYear,
    dateCells: Object.fromEntries(mergedDateCells),
    selectedColorTexture: isColorTextureCode(loadedRecord.selectedColorTexture)
      ? loadedRecord.selectedColorTexture
      : currentState.selectedColorTexture,
    selectedView: isCalendarView(loadedRecord.selectedView) ? loadedRecord.selectedView : currentState.selectedView,
  }
}
