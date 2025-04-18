"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Star, StarOff } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"

// Google Fonts API URL
const API_URL = "https://www.googleapis.com/webfonts/v1/webfonts?key=AIzaSyAd-_QvQBBTIcCJZE8X6RGFyVqAfR7hDBc"

// Popular Google Fonts as fallback
const POPULAR_FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "Raleway",
  "Oswald",
  "Merriweather",
  "Playfair Display",
  "Source Sans Pro",
  "Ubuntu",
  "Nunito",
  "Rubik",
  "Work Sans",
  "Quicksand",
  "Fira Sans",
  "Mulish",
  "Barlow",
  "Noto Sans",
]

interface FontSelectorProps {
  onFontSelect: (font: string) => void
  selectedFont: string
  favorites: string[]
  onToggleFavorite: (font: string) => void
}

export default function FontSelector({ onFontSelect, selectedFont, favorites, onToggleFavorite }: FontSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [fonts, setFonts] = useState<string[]>(POPULAR_FONTS)
  const [allFonts, setAllFonts] = useState<string[]>(POPULAR_FONTS)
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Fetch fonts from Google Fonts API or use fallback
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        setLoading(true)
        const response = await fetch(API_URL)
        const data = await response.json()

        if (data && data.items) {
          const fontNames = data.items.map((font: any) => font.family)
          setAllFonts(fontNames)
          setFonts(fontNames.slice(0, 100)) // Show first 100 fonts initially
        }
      } catch (error) {
        console.error("Error fetching Google Fonts:", error)
        // Fallback to popular fonts if API fails
        setAllFonts(POPULAR_FONTS)
        setFonts(POPULAR_FONTS)
      } finally {
        setLoading(false)
      }
    }

    fetchFonts()
  }, [])

  // Filter fonts when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true)
      const filteredFonts = allFonts.filter((font) => font.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
      setFonts(filteredFonts.length > 0 ? filteredFonts : [])
      setLoading(false)
    } else {
      setFonts(allFonts.slice(0, 100))
    }
  }, [debouncedSearchTerm, allFonts])

  // Load font styles for selected and previewed fonts
  useEffect(() => {
    const link = document.createElement("link")
    link.href = `https://fonts.googleapis.com/css2?family=${selectedFont.replace(" ", "+")}&display=swap`
    link.rel = "stylesheet"
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [selectedFont])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Google fonts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>

      <div className="h-[200px] overflow-y-auto border rounded-md p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">Loading fonts...</p>
          </div>
        ) : fonts.length > 0 ? (
          <ul className="space-y-1">
            {fonts.map((font) => (
              <li
                key={font}
                className={`p-2 cursor-pointer rounded-md hover:bg-muted transition-colors flex justify-between items-center ${
                  selectedFont === font ? "bg-muted" : ""
                }`}
                onClick={() => onFontSelect(font)}
              >
                <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(font)
                  }}
                >
                  {favorites.includes(font) ? (
                    <Star className="h-4 w-4 fill-current text-amber-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">No fonts found matching "{searchTerm}"</p>
          </div>
        )}
      </div>
    </div>
  )
}
