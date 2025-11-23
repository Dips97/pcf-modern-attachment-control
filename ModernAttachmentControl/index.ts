import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from "react";
import { createRoot, Root } from "react-dom/client";
import {
  ModernAttachmentCtrl,
  FileInfo,
} from "./ModernAttachmentControlComponent";
import { JSONSchema4 } from "json-schema";

export class ModernAttachmentControl
  implements ComponentFramework.StandardControl<IInputs, IOutputs>
{
  // --- PCF plumbing ---
  private container!: HTMLDivElement;
  private notifyOutputChanged!: () => void;
  private root: Root | null = null;
  private context!: ComponentFramework.Context<IInputs>;

  // --- Data & schema storage ---
  private files: FileInfo[] = [];
  private fileSchema = "";
  private lastError = "";
  private lastReset = false;
  private clearToken?: number;

  // --- Build our JSON schema for the files output ---
  private setFilesSchema() {
    if (this.fileSchema) return; // Only generate once
    const schema: JSONSchema4 = {
      $schema: "http://json-schema.org/draft-04/schema#",
      title: "attachedFiles",
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "object",
            properties: {
              FileName: { type: "string" },
              Type: { type: "string" },
              ContentType: { type: "string" },
              Base64: { type: "string" },
            },
          },
        },
      },
    };
    this.fileSchema = JSON.stringify(schema);
  }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
    state: ComponentFramework.Dictionary,
    container: HTMLDivElement
  ): void {
    this.context = context; // <— store context
    this.notifyOutputChanged = notifyOutputChanged;
    this.container = container;
    context.mode.trackContainerResize(true);

    // initialize empty outputs so Canvas sees the schema immediately
    this.files = [];
    this.setFilesSchema();
  }

  // Stable callback for file changes
  private handleFilesChanged = (files: FileInfo[]) => {
    this.files = files;
    this.notifyOutputChanged();
  };

  // Stable callback for errors
  private handleError = (err: string) => {
    this.lastError = err;
    if (err) {
      this.context.events.OnError();
    }
    this.notifyOutputChanged();
  };

  // --- UPDATE: render React with all props, including onError handler ---
  public updateView(context: ComponentFramework.Context<IInputs>): void {
    this.context = context; // <— keep context up‑to‑date
    // --- Handle reset from Canvas: only when it flips false -> true
    const incomingReset = !!context.parameters.reset.raw;
    if (incomingReset && !this.lastReset) {
      // Clear host-side outputs silently (no notify) so the app doesn't get spurious OnChange
      this.files = [];
      this.notifyOutputChanged();
      // Produce a new token that tells React to clear its UI and <input type="file">
      this.clearToken = Date.now();
    } else if (!incomingReset && this.lastReset) {
      // Reset is released; we don't need a token anymore
      this.clearToken = undefined;
    }
    this.lastReset = incomingReset;

    const props = {
      allowedFileTypes:
        context.parameters.allowedFileTypes.raw ||
        "pdf,docx,xlsx,txt,pptx,csv",
      maxFiles: context.parameters.maxFiles.raw || 10,
      maxFileSizeMB: context.parameters.maxFileSizeMB.raw || 10,
      buttonLabel: context.parameters.buttonLabel.raw || "Upload File",
      onFilesChanged: this.handleFilesChanged,
      buttonFillColor: context.parameters.buttonFillColor.raw || "#0078d4",
      buttonFontColor: context.parameters.buttonFontColor.raw || "#ffffff",
      disabledFillColor: context.parameters.disabledFillColor.raw || "#f3f2f1",
      disabledFontColor: context.parameters.disabledFontColor.raw || "#a6a6a6",
      removeIconColor: context.parameters.removeIconColor.raw || "#ff0000",
      buttonIconName: context.parameters.buttonIconName.raw || "Upload",
      buttonBorderColor: context.parameters.buttonBorderColor.raw || "#005a9e",
      buttonSize: context.parameters.buttonSize.raw || "Medium",
      buttonVerticalAlign: context.parameters.buttonVerticalAlign.raw || "Top",
      buttonHorizontalAlign:
        context.parameters.buttonHorizontalAlign.raw || "Left",
      showFileInfoList: context.parameters.showFileInfoList.raw || "Hide",
      buttonTooltip: context.parameters.buttonTooltip.raw || "Upload file",
      borderStyle: context.parameters.borderStyle.raw || "Solid",
      borderThickness: context.parameters.borderThickness.raw || 2,
      borderColor: context.parameters.borderColor.raw || "#cccccc",
      // reset: context.parameters.reset.raw || false,
      clearToken: this.clearToken,
      showErrorMessage: context.parameters.showErrorMessage.raw || false,
      buttonBorderRadius: context.parameters.buttonBorderRadius.raw || 5,

      // <-- onError callback -->
      onError: this.handleError,
    };

    if (!this.root) {
      this.root = createRoot(this.container);
    }
    this.root.render(React.createElement(ModernAttachmentCtrl, props));
  }

  // --- OUTPUTS: actual file data, schema, and lastError ---
  public getOutputs(): IOutputs {
    return {
      errorMessage: this.lastError,
      attachedFiles: {
        files: this.files,
      },
      attachedFilesSchema: this.fileSchema,
    };
  }

  // --- Tell Canvas the schema for attachedFiles ---
  public async getOutputSchema(
    context: ComponentFramework.Context<IInputs>
  ): Promise<Record<string, unknown>> {
    return Promise.resolve({
      attachedFiles: JSON.parse(this.fileSchema),
    });
  }

  // --- CLEANUP ---
  public destroy(): void {
    this.root?.unmount();
  }
}
