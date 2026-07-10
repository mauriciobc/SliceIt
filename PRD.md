Perfect. With those final decisions, the requirements are sufficiently complete to move directly into design and implementation.

# Product Specification: Radial Infographic Generator

## Goal

A standalone web application that allows infrastructure analysts to generate customizable radial infographics inspired by the examples provided.

The application should:

* Generate the radial geometry automatically
* Adapt to multiple aspect ratios
* Support manual data entry and file imports
* Export publication-ready PNG and SVG files
* Require no backend or authentication for the MVP

***

# Functional Requirements

## Canvas Configuration

### Supported Aspect Ratios

Presets:

```text
1:1
4:5
16:9
9:16
4:3
Custom
```

Example dimensions:

```text
1080 × 1080
1080 × 1350
1920 × 1080
1080 × 1920
1600 × 1200
```

### Layout Behavior

#### Square Layout

```text
Circle centered
Equal radial wedges
```

Like the first reference.

#### Landscape Layout

```text
Center remains circular
Wedges stretch horizontally
```

Like the second reference.

#### Portrait Layout

```text
Center remains circular
Wedges stretch vertically
```

***

# Center Wheel

## Text Fields

```text
Title
Subtitle
Footer Caption
```

Example:

```text
EVERY
MINUTE
OF THE DAY
```

***

## Logo Support

Maximum:

```text
3 logos
```

Supported formats:

```text
SVG
PNG
```

Placement:

```text
Top
Center
Bottom

or

Automatic positioning
```

***

## Center Color

Automatically derived from palette.

Example algorithm:

```text
Average all slice colors
Increase luminance by 15%
Reduce saturation by 10%
```

Result:

```text
Visually cohesive center wheel
```

***

# Slice Configuration

Each slice contains:

```typescript
interface Slice {
  id: string;
  metric: string;
  label: string;
  color?: string;
  icon?: string;
}
```

Example:

```json
{
  "metric": "46M",
  "label": "API CALLS PROCESSED",
  "color": "#4CC9F0"
}
```

***

# Slice Count

Automatic calculation:

```text
angle = 360 / sliceCount
```

Constraints:

```text
Minimum: 4
Recommended: 8–24
Hard Limit: 36
```

Warning shown after:

```text
24 slices
```

Error shown above:

```text
36 slices
```

***

# Icons

## Global Toggle

```text
Show Icons
```

OFF

```text
Metric
Label
```

ON

```text
Metric
Label
Icon
```

***

## Icon Sources

### Option 1

User upload:

```text
SVG
PNG
```

### Option 2

Built-in icon library

Examples:

```text
Cloud
Database
Server
Storage
Security
Identity
Monitoring
Network
DevOps
AI
Container
API
```

***

## Position

Automatically positioned near center.

Like both reference infographics.

***

# Color System

Three palette modes.

***

## Mode 1 — Single Color

User selects:

```text
#0066FF
```

System generates:

```text
Blue
Azure
Cyan
Teal
Green
```

around the wheel.

***

## Mode 2 — Start / End

User selects:

```text
Start:#3CB371
End:#0077FF
```

System interpolates all slices.

***

## Mode 3 — Manual

Each slice color individually controlled.

***

# Typography

## Font Source

Google Fonts integration.

Examples:

```text
Inter
Montserrat
Oswald
Roboto Condensed
Poppins
Bebas Neue
Anton
```

***

## Font Assignment

Separate controls for:

```text
Center Title Font
Metric Font
Label Font
```

***

# Text Layout Engine

Critical feature.

## Rules

### Rule 1

Text always remains horizontal.

Never rotated.

***

### Rule 2

Text never crosses wedge boundaries.

Renderer calculates safe bounding box.

***

### Rule 3

Automatic wrapping.

Example:

```text
APPLICATION
INSIGHTS
REQUESTS
```

***

### Rule 4

Automatic font scaling.

Example:

```text
40
36
32
28
24
20
16
```

until fit achieved.

***

### Rule 5

Overflow warning.

Example:

```text
Label too long for current slice count.
```

***

# Import Features

## Manual Entry

Primary workflow.

***

## CSV Upload

Example:

```csv
metric,label,color
46M,API Calls,#0099FF
12K,Incidents,#11CC66
5.1M,Requests,#7744AA
```

***

## JSON Upload

Example:

```json
{
  "title": "EVERY MINUTE",
  "slices": [
    {
      "metric": "46M",
      "label": "API Calls",
      "color": "#0099FF"
    }
  ]
}
```

***

# Project Save Format

Optional.

Stored as:

```json
{
  "canvas": {},
  "palette": {},
  "center": {},
  "slices": []
}
```

Users can:

```text
Save Project
Load Project
```

locally.

No database required.

***

# Export

## SVG

Vector export.

```text
Preserves geometry
Preserves logos
Preserves text
```

***

## PNG

Raster export.

Uses current aspect ratio.

Examples:

```text
1080×1080
1920×1080
1080×1350
1080×1920
```

Digital quality only.

***

# UX Layout

```text
┌──────────────────────────────────────────┐
│ HEADER                                   │
├──────────────────────┬───────────────────┤
│                      │                   │
│                      │ Canvas            │
│                      │                   │
│                      │ Center            │
│                      │                   │
│      PREVIEW         │ Palette           │
│                      │                   │
│                      │ Slices            │
│                      │                   │
│                      │ Import            │
│                      │ Export            │
│                      │                   │
├──────────────────────┴───────────────────┤
│ STATUS BAR                               │
└──────────────────────────────────────────┘
```

***

# Recommended Tech Stack

## MVP

```text
React
TypeScript
Vite
SVG Rendering
```

Libraries:

```text
d3-shape
d3-scale
papaparse
react-dropzone
html-to-image
file-saver
```

***

# Rendering Architecture

```text
Canvas
 ├── CenterWheel
 │   ├── Title
 │   ├── Subtitle
 │   └── Logos
 │
 ├── SliceRenderer
 │   ├── Wedge
 │   ├── TextBounds
 │   ├── Metric
 │   ├── Label
 │   └── Icon
 │
 └── ExportLayer
```

***

# MVP Backlog

### Phase 1

* SVG rendering engine
* Aspect ratio support
* Center wheel
* Automatic slice generation

### Phase 2

* Palette engine
* Text fitting engine
* Slice editor

### Phase 3

* Icon upload
* Logo upload
* CSV import

### Phase 4

* SVG export
* PNG export
* Save/open project

### Phase 5

* Google Fonts integration
* Accessibility validation
* Performance optimization

This specification is now detailed enough to begin building the application, creating wireframes, or generating the complete React/Vite codebase.
