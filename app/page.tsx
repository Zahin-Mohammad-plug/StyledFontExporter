"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, AlignLeft, AlignCenter, AlignRight, AlignJustify, Star, HelpCircle } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import FontSelector from "@/components/font-selector"
import UploadedFonts from "@/components/uploaded-fonts"
import { useDebounce } from "@/hooks/use-debounce"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Types for our settings and font
interface TextSettings {
  text: string
  fontSize: number
  fontWeight: number
  letterSpacing: number
  lineHeight: number
  color: string
  alignment: string
  fontFamily: string
}

interface FontData {
  name: string
  url: string
  weights?: number[]
}

// Available font weights
const ALL_FONT_WEIGHTS = [100, 200, 300, 400, 500, 600, 700, 800, 900]

export default function FontCustomizer() {
  // State for text settings
  const [settings, setSettings] = useState<TextSettings>({
    text: "Enter your text here\nSupports multiple lines",
    fontSize: 48,
    fontWeight: 400,
    letterSpacing: 0,
    lineHeight: 1.5,
    color: "#000000",
    alignment: "center",
    fontFamily: "Inter",
  })

  // State for fonts
  const [selectedFont, setSelectedFont] = useState("Inter")
  const [uploadedFonts, setUploadedFonts] = useState<FontData[]>([])
  const [favorites, setFavorites] = useState<string[]>([])
  const [availableWeights, setAvailableWeights] = useState<number[]>(ALL_FONT_WEIGHTS)

  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const debouncedText = useDebounce(settings.text, 300)

  // Load saved settings and fonts from localStorage
  useEffect(() => {
    try {
      // Load settings
      const savedSettings = localStorage.getItem("fontCustomizerSettings")
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings)
        setSettings(parsedSettings)
        setSelectedFont(parsedSettings.fontFamily)
      }

      // Load uploaded fonts
      const savedFonts = localStorage.getItem("uploadedFonts")
      if (savedFonts) {
        const parsedFonts = JSON.parse(savedFonts)
        setUploadedFonts(parsedFonts)

        // Load each font into the document
        parsedFonts.forEach((font: FontData) => {
          loadFontIntoDocument(font.name, font.url)
        })
      }

      // Load favorites
      const savedFavorites = localStorage.getItem("favoriteFonts")
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites))
      }
    } catch (error) {
      console.error("Error loading saved settings:", error)
    }
  }, [])

  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "fontCustomizerSettings",
        JSON.stringify({
          ...settings,
          fontFamily: selectedFont,
        }),
      )
    } catch (error) {
      console.error("Error saving settings:", error)
    }
  }, [settings, selectedFont])

  // Update available weights when font changes
  useEffect(() => {
    // For uploaded fonts, check if we have weight information
    const uploadedFont = uploadedFonts.find((f) => f.name === selectedFont)
    if (uploadedFont && uploadedFont.weights) {
      setAvailableWeights(uploadedFont.weights)

      // If current weight is not available, set to closest available
      if (!uploadedFont.weights.includes(settings.fontWeight)) {
        const closestWeight = findClosestWeight(settings.fontWeight, uploadedFont.weights)
        updateSettings({ fontWeight: closestWeight })
      }
      return
    }

    // For preset fonts, we'll assume all weights are available
    // In a real app, you would check which weights are actually available
    setAvailableWeights(ALL_FONT_WEIGHTS)
  }, [selectedFont, uploadedFonts])

  // Find closest available font weight
  const findClosestWeight = (target: number, available: number[]): number => {
    if (available.includes(target)) return target
    return available.reduce((prev, curr) => (Math.abs(curr - target) < Math.abs(prev - target) ? curr : prev))
  }

  // Update settings with a partial update
  const updateSettings = (update: Partial<TextSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...update,
    }))
  }

  // Load font into document
  const loadFontIntoDocument = (fontName: string, fontUrl: string) => {
    // Check if the font is already loaded
    if (document.fonts && document.fonts.check(`1em "${fontName}"`)) {
      return
    }

    // Create a style element to load the custom font
    const style = document.createElement("style")
    style.textContent = `
      @font-face {
        font-family: "${fontName}";
        src: url(${fontUrl}) format("truetype");
        font-weight: normal;
        font-style: normal;
      }
    `
    document.head.appendChild(style)
  }

  // Handle custom font upload
  const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fontUrl = e.target?.result as string
        // Clean up font name - remove extension and replace spaces/special chars
        const fontName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "_")

        // Create a new font object with default weights
        const newFont: FontData = {
          name: fontName,
          url: fontUrl,
          weights: [400, 700], // Default to normal and bold
        }

        loadFontIntoDocument(fontName, fontUrl)

        // Add to uploaded fonts array
        setUploadedFonts((prev) => {
          const updated = [...prev, newFont]
          // Save to localStorage
          localStorage.setItem("uploadedFonts", JSON.stringify(updated))
          return updated
        })

        // Select the newly uploaded font
        setSelectedFont(fontName)
        updateSettings({ fontFamily: fontName })

        toast({
          title: "Font uploaded successfully",
          description: `"${fontName}" has been added to your fonts`,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  // Toggle font as favorite
  const toggleFavorite = (fontName: string) => {
    setFavorites((prev) => {
      let updated
      if (prev.includes(fontName)) {
        updated = prev.filter((name) => name !== fontName)
      } else {
        updated = [...prev, fontName]
      }

      // Save to localStorage
      localStorage.setItem("favoriteFonts", JSON.stringify(updated))
      return updated
    })
  }

  // Export as PNG with proper sizing
  const exportAsPNG = () => {
    if (!previewRef.current) return

    const textElement = previewRef.current
    const { clientWidth, clientHeight } = textElement

    // Calculate text dimensions with padding
    const padding = 40
    const width = clientWidth + padding * 2
    const height = clientHeight + padding * 2

    const canvas = document.createElement("canvas")
    canvas.width = width * 2 // Higher resolution
    canvas.height = height * 2

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas (transparent background)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Set text properties
    ctx.scale(2, 2) // Scale for higher resolution
    ctx.textBaseline = "top"
    ctx.fillStyle = settings.color
    ctx.font = `${settings.fontWeight} ${settings.fontSize}px "${selectedFont}", sans-serif`

    // Handle text alignment
    let textX = padding
    switch (settings.alignment) {
      case "center":
        ctx.textAlign = "center"
        textX = width / 2
        break
      case "right":
        ctx.textAlign = "right"
        textX = width - padding
        break
      default:
        ctx.textAlign = "left"
    }

    // Draw multiline text
    const lines = settings.text.split("\n")
    let textY = padding

    lines.forEach((line) => {
      ctx.fillText(line, textX, textY)
      textY += settings.fontSize * settings.lineHeight
    })

    // Create download link
    const link = document.createElement("a")
    link.download = "custom-text.png"
    link.href = canvas.toDataURL("image/png")
    link.click()

    toast({
      title: "PNG exported successfully",
    })
  }

  // Export as SVG
  const exportAsSVG = () => {
    if (!previewRef.current) return

    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")

    // Get text dimensions
    const textElement = previewRef.current
    const { clientWidth, clientHeight } = textElement

    // Add padding
    const padding = 40
    const width = clientWidth + padding * 2
    const height = clientHeight + padding * 2

    // Set SVG attributes
    svg.setAttribute("width", `${width}`)
    svg.setAttribute("height", `${height}`)
    svg.setAttribute("xmlns", svgNS)

    // Split text into lines
    const lines = settings.text.split("\n")

    // Calculate vertical position for the first line
    let yPos = padding + settings.fontSize

    // Calculate x position based on alignment
    let xPos
    let textAnchor

    switch (settings.alignment) {
      case "center":
        xPos = width / 2
        textAnchor = "middle"
        break
      case "right":
        xPos = width - padding
        textAnchor = "end"
        break
      default:
        xPos = padding
        textAnchor = "start"
    }

    // Create each line as a text element
    lines.forEach((line) => {
      const textNode = document.createElementNS(svgNS, "text")
      textNode.setAttribute("x", `${xPos}`)
      textNode.setAttribute("y", `${yPos}`)
      textNode.setAttribute("font-family", `"${selectedFont}", sans-serif`)
      textNode.setAttribute("font-size", `${settings.fontSize}px`)
      textNode.setAttribute("font-weight", `${settings.fontWeight}`)
      textNode.setAttribute("letter-spacing", `${settings.letterSpacing}px`)
      textNode.setAttribute("fill", settings.color)
      textNode.setAttribute("text-anchor", textAnchor)
      textNode.textContent = line

      svg.appendChild(textNode)

      // Move to next line position
      yPos += settings.fontSize * settings.lineHeight
    })

    // Create download link
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.download = "custom-text.svg"
    link.href = url
    link.click()

    URL.revokeObjectURL(url)

    toast({
      title: "SVG exported successfully",
    })
  }

  return (
    <div className="container mx-auto py-4 px-2 md:py-8 md:px-4 min-h-screen flex flex-col" ref={containerRef}>
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-center">Font Customization Tool</h1>
        <p className="text-center text-muted-foreground max-w-2xl mx-auto">
          Create beautiful text designs with custom fonts, sizes, and colors. Perfect for social media posts, logos,
          headers, and more. Export your designs as PNG or SVG for use in any project.
        </p>
      </header>

      {/* Mobile-friendly layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 flex-grow">
        {/* Preview Panel - Full width on mobile, column in desktop */}
        <Card className="md:col-span-2 lg:col-span-1 lg:row-span-2 order-1 md:order-2 lg:order-2">
          <CardContent className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Preview</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <HelpCircle className="h-4 w-4" />
                    <span>How to Use</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>How to Use the Font Customizer</DialogTitle>
                    <DialogDescription>A step-by-step guide to creating beautiful text designs</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <h3 className="font-medium mb-1">1. Enter Your Text</h3>
                      <p className="text-sm text-muted-foreground">
                        Type or paste your text in the text area. You can use multiple lines.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">2. Choose a Font</h3>
                      <p className="text-sm text-muted-foreground">
                        Select from preset fonts or upload your own TTF/OTF files. You can also mark fonts as favorites.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">3. Customize Your Text</h3>
                      <p className="text-sm text-muted-foreground">
                        Adjust size, weight, spacing, line height, color, and alignment to get the perfect look.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">4. Export Your Design</h3>
                      <p className="text-sm text-muted-foreground">
                        Download your text as a PNG with transparent background or as a scalable SVG vector.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Tips</h3>
                      <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                        <li>Your settings are automatically saved for your next visit</li>
                        <li>Uploaded fonts are stored in your browser for future use</li>
                        <li>Use favorites to quickly access your most-used fonts</li>
                      </ul>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="w-full bg-neutral-50 dark:bg-neutral-900 border rounded-lg p-6 md:p-8 min-h-[200px] md:min-h-[300px] flex items-center justify-center overflow-auto">
              <div
                ref={previewRef}
                style={{
                  fontFamily: `"${selectedFont}", sans-serif`,
                  fontSize: `${settings.fontSize}px`,
                  fontWeight: settings.fontWeight,
                  letterSpacing: `${settings.letterSpacing}px`,
                  lineHeight: settings.lineHeight,
                  color: settings.color,
                  textAlign: settings.alignment as any,
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                  maxWidth: "100%",
                }}
              >
                {debouncedText || "Enter your text"}
              </div>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              <Button onClick={exportAsPNG} className="flex items-center gap-2">
                <Download size={16} />
                Export PNG
              </Button>
              <Button onClick={exportAsSVG} className="flex items-center gap-2">
                <Download size={16} />
                Export SVG
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Text & Font Panel */}
        <Card className="order-2 md:order-1 lg:order-1">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-bold mb-2">Text & Font</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="text-input">Your Text</Label>
                <Textarea
                  id="text-input"
                  value={settings.text}
                  onChange={(e) => updateSettings({ text: e.target.value })}
                  placeholder="Enter your text here"
                  className="min-h-[100px] font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label>Text Alignment</Label>
                <ToggleGroup
                  type="single"
                  value={settings.alignment}
                  onValueChange={(value) => value && updateSettings({ alignment: value })}
                  className="justify-start"
                >
                  <ToggleGroupItem value="left" aria-label="Align left">
                    <AlignLeft className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="center" aria-label="Align center">
                    <AlignCenter className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="right" aria-label="Align right">
                    <AlignRight className="h-4 w-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="justify" aria-label="Justify">
                    <AlignJustify className="h-4 w-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Tabs defaultValue="preset">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="preset">Preset Fonts</TabsTrigger>
                  <TabsTrigger value="uploaded">Uploaded</TabsTrigger>
                  <TabsTrigger value="favorites">Favorites</TabsTrigger>
                </TabsList>

                <TabsContent value="preset" className="space-y-4">
                  <FontSelector
                    onFontSelect={(font) => {
                      setSelectedFont(font)
                      updateSettings({ fontFamily: font })
                    }}
                    selectedFont={selectedFont}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </TabsContent>

                <TabsContent value="uploaded" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="font-upload">Upload OTF/TTF Font</Label>
                    <Input id="font-upload" type="file" accept=".ttf,.otf" onChange={handleFontUpload} />
                  </div>
                  <UploadedFonts
                    fonts={uploadedFonts}
                    selectedFont={selectedFont}
                    onFontSelect={(font) => {
                      setSelectedFont(font)
                      updateSettings({ fontFamily: font })
                    }}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                  />
                </TabsContent>

                <TabsContent value="favorites" className="space-y-4">
                  {favorites.length > 0 ? (
                    <div className="h-[200px] overflow-y-auto border rounded-md p-2">
                      <ul className="space-y-1">
                        {favorites.map((font) => (
                          <li
                            key={font}
                            className={`p-2 cursor-pointer rounded-md hover:bg-muted transition-colors flex justify-between items-center ${
                              selectedFont === font ? "bg-muted" : ""
                            }`}
                            onClick={() => {
                              setSelectedFont(font)
                              updateSettings({ fontFamily: font })
                            }}
                          >
                            <span style={{ fontFamily: `"${font}", sans-serif` }}>{font}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleFavorite(font)
                              }}
                            >
                              <Star className="h-4 w-4 fill-current text-amber-400" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-[200px] border rounded-md">
                      <p className="text-muted-foreground">No favorite fonts yet</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Customization Panel */}
        <Card className="order-3">
          <CardContent className="p-4 md:p-6">
            <h2 className="text-xl font-bold mb-2">Customize</h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="font-size">Font Size: {settings.fontSize}px</Label>
                </div>
                <Slider
                  id="font-size"
                  min={8}
                  max={120}
                  step={1}
                  value={[settings.fontSize]}
                  onValueChange={(value) => updateSettings({ fontSize: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="font-weight">Font Weight: {settings.fontWeight}</Label>
                <Select
                  value={settings.fontWeight.toString()}
                  onValueChange={(value) => updateSettings({ fontWeight: Number.parseInt(value) })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWeights.map((weight) => (
                      <SelectItem key={weight} value={weight.toString()}>
                        {weight === 100 && "Thin (100)"}
                        {weight === 200 && "Extra Light (200)"}
                        {weight === 300 && "Light (300)"}
                        {weight === 400 && "Regular (400)"}
                        {weight === 500 && "Medium (500)"}
                        {weight === 600 && "Semi Bold (600)"}
                        {weight === 700 && "Bold (700)"}
                        {weight === 800 && "Extra Bold (800)"}
                        {weight === 900 && "Black (900)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="letter-spacing">Letter Spacing: {settings.letterSpacing}px</Label>
                </div>
                <Slider
                  id="letter-spacing"
                  min={-5}
                  max={20}
                  step={0.1}
                  value={[settings.letterSpacing]}
                  onValueChange={(value) => updateSettings({ letterSpacing: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="line-height">Line Height: {settings.lineHeight}</Label>
                </div>
                <Slider
                  id="line-height"
                  min={0.5}
                  max={3}
                  step={0.1}
                  value={[settings.lineHeight]}
                  onValueChange={(value) => updateSettings({ lineHeight: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Text Color</Label>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: settings.color }} />
                  <Input
                    id="color"
                    value={settings.color}
                    onChange={(e) => updateSettings({ color: e.target.value })}
                    className="font-mono"
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon">
                        <span className="sr-only">Pick a color</span>
                        <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: settings.color }} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <HexColorPicker color={settings.color} onChange={(color) => updateSettings({ color })} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-8 text-right text-sm text-muted-foreground">Created by FontMaster Studio</footer>

      <Toaster />
    </div>
  )
}
