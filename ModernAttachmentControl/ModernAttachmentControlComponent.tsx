import * as React from "react";
import {
  PrimaryButton,
  MessageBar,
  MessageBarType,
  IconButton,
  Spinner,
  SpinnerSize,
} from "@fluentui/react";
import { shadeColor, stripDataUriPrefix, isFileTypeAllowed } from "./utils";

interface ModernAttachmentControlProps {
  allowedFileTypes: string;
  maxFiles: number;
  maxFileSizeMB: number;
  buttonLabel: string;
  onFilesChanged: (files: FileInfo[]) => void;
  buttonFillColor: string;
  buttonFontColor: string;
  disabledFillColor?: string;
  disabledFontColor?: string;
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

export const ModernAttachmentCtrl: React.FC<ModernAttachmentControlProps> = (
  props
) => {
  const [files, setFiles] = React.useState<FileInfo[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const seenNamesRef = React.useRef<Set<string>>(new Set());

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
      props.onError("");
    }
  }, [props.clearToken]);

  // Handle new files
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    props.onError("");
    if (!event.target.files || event.target.files.length === 0) return;

    const selectedFiles = Array.from(event.target.files);
    const maxSizeBytes = props.maxFileSizeMB * 1024 * 1024;

    // Validate extension/size FIRST
    for (const file of selectedFiles) {
      if (!isFileTypeAllowed(file.name, file.type, props.allowedFileTypes)) {
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

    // If nothing new, we're done
    if (freshFiles.length === 0) return;

    setIsLoading(true);

    try {
      const filePromises = freshFiles.map((file) => {
        return new Promise<FileInfo>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const base64 = stripDataUriPrefix(e.target?.result as string);
            const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
            resolve({
              FileName: file.name,
              Type: ext,
              ContentType: file.type,
              Base64: base64,
            });
          };
          reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const newFilesData = await Promise.all(filePromises);
      const newFiles = [...files, ...newFilesData];
      setFiles(newFiles);
      props.onFilesChanged(newFiles);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error reading files";
      setError(msg);
      props.onError(msg);
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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

    // Clear error if we are back within limits or just generally clear it on user action
    setError(null);
    props.onError("");
  };

  // Default colors and styles
  const mainColor = props.buttonFillColor || "#0078d4";
  const hoverColor = shadeColor(mainColor, 15); // Lighten 15%
  const pressedColor = shadeColor(mainColor, -10);
  const disabledFill = props.disabledFillColor || "#f3f2f1";
  const disabledFont = props.disabledFontColor || "#a6a6a6";

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
        disabled={files.length >= props.maxFiles || isLoading}
        text={isLoading ? "Uploading..." : props.buttonLabel || "Upload File"}
        iconProps={isLoading ? undefined : { iconName: props.buttonIconName || "Upload" }}
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
            background: disabledFill,
            borderColor: disabledFill,
          },
          label: {
            color: props.buttonFontColor,
            fontSize: buttonStyle.fontSize,
          },
          labelDisabled: {
            color: disabledFont,
          },
          iconDisabled: {
            color: disabledFont,
          },
        }}
      >
        {isLoading && <Spinner size={SpinnerSize.small} styles={{ root: { marginRight: 8 } }} />}
      </PrimaryButton>
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
