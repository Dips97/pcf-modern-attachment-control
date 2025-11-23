# Modern Attachment Control for Power Apps

![Version](https://img.shields.io/badge/version-1.2.0-blue) ![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white) ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB) ![Power Apps](https://img.shields.io/badge/Power%20Apps-PCF-purple)

![GitHub stars](https://img.shields.io/github/stars/Dips97/pcf-modern-attachment-control?style=social) ![GitHub forks](https://img.shields.io/github/forks/Dips97/pcf-modern-attachment-control?style=social)

A modern, highly configurable file attachment control for Power Apps Canvas Apps. Built with the Power Apps Component Framework (PCF), React, and Fluent UI, this control offers a superior user experience compared to the standard attachment controls.

## Features

- **Multi-File Upload**: Select and upload multiple files simultaneously.
- **Base64 Conversion**: Automatically converts files to Base64 strings, making them ready for Power Automate or Dataverse.
- **Robust Validation**:
  - **File Type**: Restrict uploads to specific extensions (e.g., `.pdf`, `.docx`) or MIME types.
  - **File Size**: Set maximum file size limits (in MB).
  - **Max Files**: Limit the total number of files allowed.
- **Modern UI**:
  - Built with **Microsoft Fluent UI** for a native look and feel.
  - **Loading State**: Visual feedback (spinner) during file processing.
  - **Error Handling**: Inline error messages for validation failures.
- **Extensive Customization**:
  - Customize button colors (fill, font, border, disabled states).
  - Choose button icons from the Fluent UI icon set.
  - Control button size, alignment, and border radius.
  - Toggle the visibility of the file list.
- **Structured Output**: Returns a clean JSON object containing file metadata and content.

## Installation & Usage

1.  **Download**: Get the latest solution zip or build from source.
2.  **Import**: Import the solution into your Power Apps environment.
3.  **Add to App**: In the Power Apps Studio, enable code components and add "Modern Attachment Control" to your screen.

### Building from Source

Prerequisites:

- Node.js (LTS)
- Microsoft Power Platform CLI (`pac`)

```bash
# Install dependencies
npm install

# Build the control
npm run build

# Push to your development environment
pac pcf push --publisher-prefix <your-prefix>
```

### Packaging as a Solution

To deploy the control to other environments (e.g., Production), you need to package it into a solution.

**Note:** This repository already contains a `Solutions` folder with the necessary references added. You can simply build the existing solution.

1.  **Navigate to the Solution Folder**:
    ```bash
    cd Solutions
    ```

2.  **Build the Solution**:
    ```bash
    # Build Managed Solution (Recommended for Production)
    dotnet build --configuration Release

    # Build Unmanaged Solution (For Development/Testing)
    dotnet build --configuration Debug
    ```

3.  **Locate the Zip Files**:
    The generated solution files will be in the `Solutions/bin/Release` (managed) or `Solutions/bin/Debug` (unmanaged) folder.

4.  **Import**:
    Go to the [Power Apps Maker Portal](https://make.powerapps.com/), navigate to **Solutions** -> **Import solution**, and select the generated `.zip` file.

## Configuration Properties

| Property                | Type    | Description                                                            | Default          |
| :---------------------- | :------ | :--------------------------------------------------------------------- | :--------------- |
| **Allowed File Types**  | Text    | Comma-separated list of extensions (e.g., `.pdf,.docx`) or MIME types. | `.pdf,.docx,...` |
| **Max Files**           | Number  | Maximum number of files allowed.                                       | `10`             |
| **Max File Size (MB)**  | Decimal | Maximum size per file in Megabytes.                                    | `10`             |
| **Button Label**        | Text    | Text to display on the upload button.                                  | `Upload File`    |
| **Button Icon Name**    | Text    | Fluent UI icon name (e.g., `Upload`, `Attach`).                        | `Upload`         |
| **Show File Info List** | Enum    | Show or hide the list of attached files below the button.              | `Hide`           |
| **Reset**               | Boolean | Toggle to `true` to clear all attached files programmatically.         | `false`          |
| **Show Error Message**  | Boolean | Show validation errors inline below the button.                        | `false`          |

### Styling Properties

- **Button Fill/Font Color**: Hex codes for button appearance.
- **Disabled Fill/Font Color**: Hex codes for the disabled state.
- **Button Size**: `Small`, `Medium`, `Large`.
- **Alignment**: Horizontal (`Left`, `Center`, `Right`, `Justify`) and Vertical (`Top`, `Bottom`).
- **Borders**: Style, thickness, color, and radius.

## Output Data

The control outputs a property named `attachedFiles`. This is a record containing an array of file objects.

**Schema:**

```json
{
  "files": [
    {
      "FileName": "example.pdf",
      "Type": ".pdf",
      "ContentType": "application/pdf",
      "Base64": "JVBERi0xLjcKCjEgMCBvYmoK..."
    }
  ]
}
```

**Usage in Power Apps:**

To access the uploaded files in a collection or pass them to a flow:

```powerfx
ModernAttachmentControl1.attachedFiles.files
```

## Events

- **OnError**: Triggered when a file validation fails (e.g., wrong type or too large). You can use this to show a notification banner:
  ```powerfx
  Notify(ModernAttachmentControl1.errorMessage, NotificationType.Error)
  ```

## License

MIT
