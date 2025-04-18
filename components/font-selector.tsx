"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search, Star, StarOff } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"
import { Button } from "@/components/ui/button"

// Popular preset fonts
const PRESET_FONTS = [
  "Arial",
  "Verdana",
  "Helvetica",
  "Tahoma",
  "Trebuchet MS",
  "Times New Roman",
  "Georgia",
  "Garamond",
  "Courier New",
  "Brush Script MT",
  "Impact",
  "Comic Sans MS",
  "Palatino",
  "Lucida Sans",
  "Bookman",
  "Avant Garde",
  "Candara",
  "Geneva",
  "Calibri",
  "Optima",
  "Cambria",
  "Didot",
  "Futura",
  "Century Gothic",
  "Copperplate",
]

interface FontSelectorProps {
  onFontSelect: (font: string) => void
  selectedFont: string
  favorites: string[]
  onToggleFavorite: (font: string) => void
}

export default function FontSelector({ onFontSelect, selectedFont, favorites, onToggleFavorite }: FontSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [fonts, setFonts] = useState<string[]>(PRESET_FONTS)
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filter fonts when search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setLoading(true)
      const filteredFonts = PRESET_FONTS.filter((font) =>
        font.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
      )
      setFonts(filteredFonts.length > 0 ? filteredFonts : [])
      setLoading(false)
    } else {
      setFonts(PRESET_FONTS)
    }
  }, [debouncedSearchTerm])

  // Load font styles for selected font
  useEffect(() => {
    // For system fonts, we don't need to load anything
    // This would be where you'd load Google Fonts in a real implementation
  }, [selectedFont])

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search preset fonts..."
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
