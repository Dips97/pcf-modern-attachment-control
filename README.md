# Modern Attachment Control

![Version](https://img.shields.io/badge/version-1.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Overview
Modern Attachment Control is a Power Apps Component Framework (PCF) control that delivers a configurable, Fluent UI–styled file upload experience. It streamlines file validation, styling, and data output so makers can deliver polished attachment flows without custom canvas logic.

## Features
- Multiple file selection with extension, size, and count limits
- Base64 encoding and structured output schema for downstream processing
- Fluent UI button with configurable icon, colors, borders, and alignment
- Optional file info list with remove actions and automatic error messaging
- Reset support that clears selections when triggered by app logic

## Tech Stack
- TypeScript with React 18 and Fluent UI React 8
- Power Apps Component Framework runtime
- pcf-scripts build tooling with ESLint (TypeScript + Power Apps rules)

## Prerequisites
- Node.js 18+ and npm
- Microsoft Power Apps CLI (for packaging/deployment)

## Install
```pwsh
npm install
```

## Scripts to Build
- `npm run build` – Compile the control for deployment
- `cd Solutions` – Navigate to solution packaging project
- `dotnet build` – Build solution artifacts (requires .NET SDK)

## Configuration Properties
- `allowedFileTypes` – Comma-separated list of permitted extensions (`.pdf,.docx`)
- `maxFiles` / `maxFileSizeMB` – Hard limits for selection count and size
- `buttonLabel`, `buttonIconName`, `buttonTooltip` – Primary button text and icon
- `buttonFillColor`, `buttonFontColor`, `buttonBorderColor` – Visual styling
- `buttonSize`, `buttonVerticalAlign`, `buttonHorizontalAlign` – Layout controls
- `showFileInfoList` – Toggle the file info list display
- `removeIconColor` – Fluent UI icon color for item removal
- `borderStyle`, `borderThickness`, `borderColor` – Container border options
- `reset` – Boolean flag that clears selected attachments when set

## Outputs & Schema
- `attachedFiles` – Object containing an array of FileInfo entries (name, type, MIME type, Base64 content)
- `attachedFilesSchema` – JSON schema generated at runtime so Canvas apps can bind to the structured output

## Development Workflow
- Update manifest, strings, or React component code in `ModernAttachmentControl/`
- Run `npm run start` during development to preview in the PCF test harness
- Use `npm run build` before packaging and `pac pcf push` to publish to an environment
- After each change bump the control version in `ModernAttachmentControl/ControlManifest.Input.xml`, then push to Power Apps so existing apps receive the update

## License
```
MIT License

Copyright (c) 2025 Dips97

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

