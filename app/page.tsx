"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download } from "lucide-react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import FontSelector from "@/components/font-selector"
import { useDebounce } from "@/hooks/use-debounce"

export default function FontCustomizer() {
  const [text, setText] = useState("Enter your text here")
  const [fontSize, setFontSize] = useState(48)
  const [fontWeight, setFontWeight] = useState(400)
  const [letterSpacing, setLetterSpacing] = useState(0)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [color, setColor] = useState("#000000")
  const [selectedFont, setSelectedFont] = useState("Inter")
  const [customFont, setCustomFont] = useState<string | null>(null)
  const [fontLoaded, setFontLoaded] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)

  const debouncedText = useDebounce(text, 300)

  // Handle custom font upload
  const handleFontUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const fontData = e.target?.result as string
        const fontName = file.name.split(".")[0]

        // Create a style element to load the custom font
        const style = document.createElement("style")
        style.textContent = `
          @font-face {
            font-family: "${fontName}";
            src: url(${fontData}) format("truetype");
            font-weight: normal;
            font-style: normal;
          }
        `
        document.head.appendChild(style)

        setSelectedFont(fontName)
        setCustomFont(fontName)
        setFontLoaded(true)
      }
      reader.readAsDataURL(file)
    }
  }

  // Export as PNG
  const exportAsPNG = () => {
    if (!previewRef.current) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions based on the text size
    const textElement = previewRef.current
    const { width, height } = textElement.getBoundingClientRect()

    canvas.width = width * 2 // Higher resolution
    canvas.height = height * 2

    // Set transparent background
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw text
    ctx.scale(2, 2) // Scale for higher resolution
    ctx.font = `${fontWeight} ${fontSize}px "${selectedFont}", sans-serif`
    ctx.fillStyle = color
    ctx.textBaseline = "top"
    ctx.letterSpacing = `${letterSpacing}px`
    ctx.fillText(debouncedText, 0, 0)

    // Create download link
    const link = document.createElement("a")
    link.download = "custom-text.png"
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  // Export as SVG
  const exportAsSVG = () => {
    if (!previewRef.current) return

    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")

    // Get text dimensions
    const textElement = previewRef.current
    const { width, height } = textElement.getBoundingClientRect()

    // Set SVG attributes
    svg.setAttribute("width", `${width}`)
    svg.setAttribute("height", `${height}`)
    svg.setAttribute("xmlns", svgNS)

    // Create text element
    const textNode = document.createElementNS(svgNS, "text")
    textNode.setAttribute("x", "0")
    textNode.setAttribute("y", `${fontSize}`) // Adjust for baseline
    textNode.setAttribute("font-family", `"${selectedFont}", sans-serif`)
    textNode.setAttribute("font-size", `${fontSize}px`)
    textNode.setAttribute("font-weight", `${fontWeight}`)
    textNode.setAttribute("letter-spacing", `${letterSpacing}px`)
    textNode.setAttribute("fill", color)
    textNode.textContent = debouncedText

    svg.appendChild(textNode)

    // Create download link
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.download = "custom-text.svg"
    link.href = url
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Font Customization Tool</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left panel: Text input and font selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Text & Font</CardTitle>
            <CardDescription>Enter your text and choose a font</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="text-input">Your Text</Label>
              <Input
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here"
              />
            </div>

            <Tabs defaultValue="google">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="google">Google Fonts</TabsTrigger>
                <TabsTrigger value="upload">Upload Font</TabsTrigger>
              </TabsList>

              <TabsContent value="google" className="space-y-4">
                <FontSelector onFontSelect={setSelectedFont} selectedFont={selectedFont} />
              </TabsContent>

              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="font-upload">Upload OTF/TTF Font</Label>
                  <Input id="font-upload" type="file" accept=".ttf,.otf" onChange={handleFontUpload} />
                  {customFont && <p className="text-sm text-green-600">Font "{customFont}" loaded successfully</p>}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Middle panel: Preview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>See your text in real-time</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] flex items-center justify-center p-8 border rounded-md">
            <div
              ref={previewRef}
              style={{
                fontFamily: `"${selectedFont}", sans-serif`,
                fontSize: `${fontSize}px`,
                fontWeight: fontWeight,
                letterSpacing: `${letterSpacing}px`,
                lineHeight: lineHeight,
                color: color,
                wordBreak: "break-word",
                maxWidth: "100%",
                textAlign: "center",
              }}
            >
              {debouncedText || "Enter your text"}
            </div>
          </CardContent>
          <CardFooter className="flex justify-center gap-4">
            <Button onClick={exportAsPNG} className="flex items-center gap-2">
              <Download size={16} />
              Export PNG
            </Button>
            <Button onClick={exportAsSVG} className="flex items-center gap-2">
              <Download size={16} />
              Export SVG
            </Button>
          </CardFooter>
        </Card>

        {/* Right panel: Customization options */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Customize</CardTitle>
            <CardDescription>Adjust text properties</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="font-size">Font Size: {fontSize}px</Label>
              </div>
              <Slider
                id="font-size"
                min={8}
                max={120}
                step={1}
                value={[fontSize]}
                onValueChange={(value) => setFontSize(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-weight">Font Weight</Label>
              <Select value={fontWeight.toString()} onValueChange={(value) => setFontWeight(Number.parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Thin (100)</SelectItem>
                  <SelectItem value="200">Extra Light (200)</SelectItem>
                  <SelectItem value="300">Light (300)</SelectItem>
                  <SelectItem value="400">Regular (400)</SelectItem>
                  <SelectItem value="500">Medium (500)</SelectItem>
                  <SelectItem value="600">Semi Bold (600)</SelectItem>
                  <SelectItem value="700">Bold (700)</SelectItem>
                  <SelectItem value="800">Extra Bold (800)</SelectItem>
                  <SelectItem value="900">Black (900)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="letter-spacing">Letter Spacing: {letterSpacing}px</Label>
              </div>
              <Slider
                id="letter-spacing"
                min={-5}
                max={20}
                step={0.1}
                value={[letterSpacing]}
                onValueChange={(value) => setLetterSpacing(value[0])}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="line-height">Line Height: {lineHeight}</Label>
              </div>
              <Slider
                id="line-height"
                min={0.5}
                max={3}
                step={0.1}
                value={[lineHeight]}
                onValueChange={(value) => setLineHeight(value[0])}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">Text Color</Label>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-md border" style={{ backgroundColor: color }} />
                <Input id="color" value={color} onChange={(e) => setColor(e.target.value)} className="font-mono" />
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="icon">
                      <span className="sr-only">Pick a color</span>
                      <span className="h-4 w-4 rounded-sm" style={{ backgroundColor: color }} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <HexColorPicker color={color} onChange={setColor} />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
