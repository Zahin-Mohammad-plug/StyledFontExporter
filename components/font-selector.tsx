"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useDebounce } from "@/hooks/use-debounce"

// Popular Google Fonts
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
}

export default function FontSelector({ onFontSelect, selectedFont }: FontSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [fonts, setFonts] = useState<string[]>(POPULAR_FONTS)
  const [loading, setLoading] = useState(false)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Load Google Fonts API
  useEffect(() => {
    // This would typically fetch from Google Fonts API
    // For this demo, we'll just filter the popular fonts list
    if (debouncedSearchTerm) {
      setLoading(true)
      setTimeout(() => {
        const filteredFonts = POPULAR_FONTS.filter((font) =>
          font.toLowerCase().includes(debouncedSearchTerm.toLowerCase()),
        )
        setFonts(filteredFonts.length > 0 ? filteredFonts : POPULAR_FONTS)
        setLoading(false)
      }, 300)
    } else {
      setFonts(POPULAR_FONTS)
    }
  }, [debouncedSearchTerm])

  // Load font styles
  useEffect(() => {
    // In a real app, we would dynamically load the font from Google Fonts
    // For this demo, we'll assume the fonts are available
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
          placeholder="Search fonts..."
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
        ) : (
          <ul className="space-y-1">
            {fonts.map((font) => (
              <li
                key={font}
                className={`p-2 cursor-pointer rounded-md hover:bg-muted transition-colors ${
                  selectedFont === font ? "bg-muted" : ""
                }`}
                style={{ fontFamily: `"${font}", sans-serif` }}
                onClick={() => onFontSelect(font)}
              >
                {font}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
