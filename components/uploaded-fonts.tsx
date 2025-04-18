"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Search, Star, StarOff } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FontData {
  name: string
  url: string
}

interface UploadedFontsProps {
  fonts: FontData[]
  selectedFont: string
  onFontSelect: (font: string) => void
  favorites: string[]
  onToggleFavorite: (font: string) => void
}

export default function UploadedFonts({
  fonts,
  selectedFont,
  onFontSelect,
  favorites,
  onToggleFavorite,
}: UploadedFontsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  // Filter fonts based on search
  const filteredFonts = searchTerm
    ? fonts.filter((font) => font.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : fonts

  return (
    <div className="space-y-4">
      {fonts.length > 0 && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search uploaded fonts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      )}

      <div className="h-[200px] overflow-y-auto border rounded-md p-2">
        {filteredFonts.length > 0 ? (
          <ul className="space-y-1">
            {filteredFonts.map((font) => (
              <li
                key={font.name}
                className={`p-2 cursor-pointer rounded-md hover:bg-muted transition-colors flex justify-between items-center ${
                  selectedFont === font.name ? "bg-muted" : ""
                }`}
                onClick={() => onFontSelect(font.name)}
              >
                <span style={{ fontFamily: `"${font.name}", sans-serif` }}>{font.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(font.name)
                  }}
                >
                  {favorites.includes(font.name) ? (
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
            {fonts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No fonts uploaded yet</p>
            ) : (
              <p className="text-sm text-muted-foreground">No uploaded fonts found matching "{searchTerm}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
