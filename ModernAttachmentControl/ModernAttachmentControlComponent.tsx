import * as React from "react";
import {
  PrimaryButton,
  MessageBar,
  MessageBarType,
  IconButton,
} from "@fluentui/react";

interface ModernAttachmentControlProps {
  allowedFileTypes: string;
  maxFiles: number;
  maxFileSizeMB: number;
  buttonLabel: string;
  onFilesChanged: (files: FileInfo[]) => void;
  buttonFillColor: string;
  buttonFontColor: string;
  removeIconColor: string;
  buttonIconName: string;

  buttonBorderColor: string;
  buttonSize: "Small" | "Medium" | "Large";
  buttonVerticalAlign: "Top" | "Bottom";
  buttonHorizontalAlign: "Left" | "Center" | "Right" | "Justify";
  showFileInfoList: "Show" | "Hide";
  buttonTooltip: string;
  borderStyle: "Solid" | "Dashed" | "Dotted" | "None";
  borderThickness: number;
  borderColor: string;
  clearToken?: number;
  buttonBorderRadius: number;
  showErrorMessage: boolean;
  onError: (err: string) => void;
}

export interface FileInfo {
  FileName: string;
  Type: string;
  ContentType: string;
  Base64: string;
}
// Function to shade a color
// This function lightens or darkens a hex color by a percentage
function shadeColor(hex: string, percent: number) {
  // Accepts "#RRGGBB", percent >0 to lighten, <0 to darken
  const c = hex.replace("#", "");
  if (c.length !== 6) return hex;
  const num = parseInt(c, 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return "#" + ((r << 16) | (g << 8) | b).toString(16).padStart(6, "0");
}

export const ModernAttachmentCtrl: React.FC<ModernAttachmentControlProps> = (
  props
) => {
  const [files, setFiles] = React.useState<FileInfo[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const seenNamesRef = React.useRef<Set<string>>(new Set());

  // Strip Data URI prefix
  const stripDataUriPrefix = (dataUri: string) => {
    const parts = dataUri.split(",");
    return parts.length > 1 ? parts[1] : dataUri;
  };
  // whenever props.reset goes true, wipe the attachments
  React.useEffect(() => {
    if (props.clearToken !== undefined) {
      // Visual clear
      setFiles([]);
      // Clear any “seen” memory so same name can be added right after reset
      seenNamesRef.current.clear();
      // Crucial: clear the DOM input value so re-selecting the same file yields fresh change payloads
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Also clear any visible error
      setError(null);
    }
  }, [props.clearToken]);
  // Handle new files
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (!event.target.files) return;

    const selectedFiles = Array.from(event.target.files);
    const maxSizeBytes = props.maxFileSizeMB * 1024 * 1024;
    const allowedTypes = props.allowedFileTypes
      .split(",")
      .map((t) => t.trim().toLowerCase());

    // Validate extension/size FIRST
    for (const file of selectedFiles) {
      const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
      if (!allowedTypes.includes(ext)) {
        const msg = `File type not allowed: ${file.name}`;
        setError(msg);
        props.onError(msg);
        return;
      }
      if (file.size > maxSizeBytes) {
        const msg = `File ${file.name} exceeds max size of ${props.maxFileSizeMB} MB`;
        setError(msg);
        props.onError(msg);
        return;
      }
    }

    // Filter out already-seen names (within this session/epoch)
    const freshFiles = selectedFiles.filter((f) => {
      if (seenNamesRef.current.has(f.name)) return false;
      seenNamesRef.current.add(f.name);
      return true;
    });

    // Count check uses "fresh" additions
    if (freshFiles.length + files.length > props.maxFiles) {
      const msg = `You can only select up to ${props.maxFiles} files`;
      setError(msg);
      props.onError(msg);
      return;
    }

    // Read as base64 only for the fresh files
    const filesRead: FileInfo[] = [];
    let toRead = freshFiles.length;

    // If nothing new, we're done
    if (toRead === 0) return;

    freshFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = stripDataUriPrefix(e.target?.result as string);
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        filesRead.push({
          FileName: file.name,
          Type: ext,
          ContentType: file.type,
          Base64: base64,
        });
        toRead--;
        if (toRead === 0) {
          const newFiles = [...files, ...filesRead];
          setFiles(newFiles);
          props.onFilesChanged(newFiles); // user-driven change
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove one file
  const handleRemoveFile = (idx: number) => {
    const removed = files[idx];
    const newFiles = files.filter((_, i) => i !== idx);
    setFiles(newFiles);
    props.onFilesChanged(newFiles);

    // Free the name so it can be re-added in this epoch
    if (removed?.FileName) {
      seenNamesRef.current.delete(removed.FileName);
    }

    if (newFiles.length <= props.maxFiles) {
      setError(null);
    }
  };

  // Default colors and styles
  const mainColor = props.buttonFillColor || "#0078d4";
  const hoverColor = shadeColor(mainColor, 15); // Lighten 15%
  const pressedColor = shadeColor(mainColor, -10);

  // Button size mapping
  const sizeMap = {
    Small: { height: 28, fontSize: 12, padding: "0 8px" },
    Medium: { height: 36, fontSize: 14, padding: "0 16px" },
    Large: { height: 44, fontSize: 16, padding: "0 24px" },
  };
  const buttonStyle = sizeMap[props.buttonSize || "Medium"];

  // Vertical alignment
  const verticalOrder = props.buttonVerticalAlign === "Top" ? 0 : 1;

  // Horizontal alignment Map
  const horizontalAlignMap: Record<string, string> = {
    Left: "flex-start",
    Center: "center",
    Right: "flex-end",
    Justify: "space-between",
  };

  // Horizontal alignment
  const justifyContent =
    horizontalAlignMap[props.buttonHorizontalAlign] || "flex-start";

  // Outer container style: full-size only when showing list
  const containerStyle: React.CSSProperties =
    props.showFileInfoList === "Hide"
      ? { display: "inline-block", margin: 0, padding: 5 }
      : {
          height: "100%",
          width: "100%",
          overflow: "hidden",
          borderStyle:
            props.borderStyle === "None"
              ? "none"
              : props.borderStyle.toLowerCase(),
          borderWidth:
            props.borderStyle === "None" ? 0 : props.borderThickness ?? 2,
          borderColor: props.borderColor || "#cccccc",
          borderRadius: 5,
          padding: 5,
          boxSizing: "border-box",
          background: "#fff", // or transparent
        };
  // File Type
  // Button row container
  const ButtonRow = (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent,
        alignItems: "center",
        width: "100%",
      }}
    >
      <PrimaryButton
        disabled={files.length >= props.maxFiles}
        text={props.buttonLabel || "Upload File"}
        iconProps={{ iconName: props.buttonIconName || "Upload" }}
        onClick={() => {
          if (fileInputRef.current) fileInputRef.current.value = "";
          fileInputRef.current?.click();
        }}
        title={props.buttonTooltip || "Upload File"}
        styles={{
          root: {
            background: mainColor,
            color: props.buttonFontColor,
            borderColor: props.buttonBorderColor,
            borderRadius: props.buttonBorderRadius,
            borderWidth: props.buttonBorderColor ? 2 : undefined,
            borderStyle: props.buttonBorderColor ? "solid" : undefined,
            ...buttonStyle,
            transition: "background 0.2s",
          },
          rootHovered: {
            background: hoverColor,
            color: props.buttonFontColor,
            borderColor: props.buttonBorderColor,
            borderRadius: props.buttonBorderRadius,
            borderWidth: props.buttonBorderColor ? 2 : undefined,
            borderStyle: props.buttonBorderColor ? "solid" : undefined,
            ...buttonStyle,
          },
          rootPressed: {
            background: pressedColor,
            color: props.buttonFontColor,
            borderColor: props.buttonBorderColor,
            borderRadius: props.buttonBorderRadius,
            borderWidth: props.buttonBorderColor ? 2 : undefined,
            borderStyle: props.buttonBorderColor ? "solid" : undefined,
            ...buttonStyle,
          },
          rootDisabled: {
            background: "#f3f2f1",
            borderColor: "#f3f2f1",
          },
          label: {
            color: props.buttonFontColor,
            fontSize: buttonStyle.fontSize,
          },
          labelDisabled: {
            color: "#a6a6a6",
          },
          iconDisabled: {
            color: "#a6a6a6",
          },
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept={props.allowedFileTypes}
        multiple={props.maxFiles > 1}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );

  // File list row: only show if file info list is enabled
  const FileListRow = props.showFileInfoList === "Show" && (
    <div
      style={{
        marginTop: 10,
        overflowY: "auto",
        maxHeight: `calc(100% - ${buttonStyle.height + 10}px)`,
      }}
    >
      {files.map((file, idx) => (
        <div
          key={idx}
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: 4,
          }}
        >
          <span title={file.FileName}>
            {file.FileName} (
            {((file.Base64.length * 0.75) / (1024 * 1024)).toFixed(2)} MB)
          </span>
          <IconButton
            iconProps={{ iconName: "Cancel" }}
            onClick={() => handleRemoveFile(idx)}
            title="Remove this file"
            styles={{
              root: { color: props.removeIconColor },
              rootHovered: {
                background: "transparent",
                color: props.removeIconColor,
              },
              rootPressed: {
                background: "transparent",
                color: props.removeIconColor,
              },
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
          justifyContent:
            props.buttonVerticalAlign === "Top" ? "flex-start" : "flex-end",
        }}
      >
        {props.buttonVerticalAlign === "Top" && ButtonRow}
        {FileListRow}
        {props.buttonVerticalAlign === "Bottom" && ButtonRow}
        {error && props.showErrorMessage && (
          <MessageBar messageBarType={MessageBarType.error}>{error}</MessageBar>
        )}
      </div>
    </div>
  );
};
