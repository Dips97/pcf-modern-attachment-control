export function shadeColor(hex: string, percent: number) {
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

export function stripDataUriPrefix(dataUri: string) {
  const parts = dataUri.split(",");
  return parts.length > 1 ? parts[1] : dataUri;
}

/**
 * Normalizes a comma-separated list of file types for the HTML input accept attribute.
 * Ensures extensions start with a dot.
 */
export function normalizeAcceptAttribute(allowedTypes: string): string {
  if (!allowedTypes || allowedTypes.trim() === "") return "";

  return allowedTypes.split(",").map((t) => {
    const type = t.trim().toLowerCase();
    // If it's not a MIME type (no slash) and doesn't start with dot, add dot
    if (type.indexOf('/') === -1 && type.indexOf('.') !== 0 && type !== "*") {
        return "." + type;
    }
    return type;
  }).join(",");
}

export function isFileTypeAllowed(fileName: string, fileType: string, allowedTypes: string): boolean {
  if (!allowedTypes || allowedTypes.trim() === "") return true;

  // Use the same normalization logic
  const normalizedTypes = normalizeAcceptAttribute(allowedTypes);
  const allowed = normalizedTypes.split(",");

  if (allowed.includes("*") || allowed.includes(".*") || allowed.includes("*.*")) return true;

  const ext = "." + (fileName.split(".").pop()?.toLowerCase() || "");
  // Check extension
  if (allowed.includes(ext)) return true;

  // Check mime type (simple check)
  // If allowed contains "image/*", and fileType is "image/png", it should pass.
  if (fileType) {
      const mimeType = fileType.toLowerCase();
      const mimeGroup = mimeType.split('/')[0] + "/*";
      if (allowed.includes(mimeType) || allowed.includes(mimeGroup)) return true;
  }

  return false;
}
