import React, { createContext, useContext, useEffect, useRef, useState } from "react"
import { ColorTextureCode, DateCellData } from "../utils/colors"
import { CalendarView, parseContextStoredData, STORAGE_KEY, StoredData, toStoredData } from "../utils/persistence"

interface CalendarContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  dateCells: Map<string, DateCellData>
  setDateCells: (dateCells: Map<string, DateCellData>) => void
  selectedColorTexture: ColorTextureCode
  setSelectedColorTexture: (colorTexture: ColorTextureCode) => void
  selectedView: CalendarView
  setSelectedView: (view: CalendarView) => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

interface CalendarProviderProps {
  children: React.ReactNode
}

export const CalendarProvider: React.FC<CalendarProviderProps> = ({ children }) => {
  const currentYear = new Date().getFullYear()

  const [selectedYear, setSelectedYearState] = useState(currentYear)
  const [dateCells, setDateCellsState] = useState<Map<string, DateCellData>>(new Map())
  const [selectedColorTexture, setSelectedColorTextureState] = useState<ColorTextureCode>("red")
  const [selectedView, setSelectedViewState] = useState<CalendarView>("Linear")
  const selectedYearRef = useRef(selectedYear)
  const dateCellsRef = useRef(dateCells)
  const selectedColorTextureRef = useRef(selectedColorTexture)
  const selectedViewRef = useRef(selectedView)

  useEffect(() => {
    selectedYearRef.current = selectedYear
    dateCellsRef.current = dateCells
    selectedColorTextureRef.current = selectedColorTexture
    selectedViewRef.current = selectedView
  }, [selectedYear, dateCells, selectedColorTexture, selectedView])

  useEffect(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY)
      if (storedData) {
        const parsedData = parseContextStoredData(storedData, currentYear)

        if (parsedData.selectedYear !== undefined) {
          setSelectedYearState(parsedData.selectedYear)
        }

        if (parsedData.dateCells !== undefined) {
          setDateCellsState(parsedData.dateCells)
        }

        if (parsedData.selectedColorTexture !== undefined) {
          setSelectedColorTextureState(parsedData.selectedColorTexture)
        }

        if (parsedData.selectedView !== undefined) {
          setSelectedViewState(parsedData.selectedView)
        }
      }
    } catch (error) {
      console.error("Error loading calendar data from localStorage:", error)
    }
  }, [currentYear])

  const saveToLocalStorage = (data: StoredData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving calendar data to localStorage:", error)
    }
  }

  const setSelectedYear = (year: number) => {
    setSelectedYearState(year)
    selectedYearRef.current = year
    saveToLocalStorage(toStoredData(year, dateCellsRef.current, selectedColorTextureRef.current, selectedViewRef.current))
  }

  const setDateCells = (newDateCells: Map<string, DateCellData>) => {
    setDateCellsState(newDateCells)
    dateCellsRef.current = newDateCells
    saveToLocalStorage(
      toStoredData(selectedYearRef.current, newDateCells, selectedColorTextureRef.current, selectedViewRef.current)
    )
  }

  const setSelectedColorTexture = (colorTexture: ColorTextureCode) => {
    setSelectedColorTextureState(colorTexture)
    selectedColorTextureRef.current = colorTexture
    saveToLocalStorage(toStoredData(selectedYearRef.current, dateCellsRef.current, colorTexture, selectedViewRef.current))
  }

  const setSelectedView = (view: CalendarView) => {
    setSelectedViewState(view)
    selectedViewRef.current = view
    saveToLocalStorage(toStoredData(selectedYearRef.current, dateCellsRef.current, selectedColorTextureRef.current, view))
  }

  const value: CalendarContextType = {
    selectedYear,
    setSelectedYear,
    dateCells,
    setDateCells,
    selectedColorTexture,
    setSelectedColorTexture,
    selectedView,
    setSelectedView,
  }

  return <CalendarContext.Provider value={value}>{children}</CalendarContext.Provider>
}

export const useCalendar = (): CalendarContextType => {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendar must be used within a CalendarProvider")
  }
  return context
}
