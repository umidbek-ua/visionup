import { ProfileSettingsState } from "../types/app";

type VisionUpProfileExport = {
  app: "VisionUp";
  schemaVersion: 1;
  exportedAt: string;
  profile: {
    name: string;
  };
  settings: ProfileSettingsState;
};

type ImportedProfileJson = {
  profileName: string;
  settings: ProfileSettingsState;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, message: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(message);
  }

  return value;
}

function assertString(value: unknown, message: string): string {
  if (typeof value !== "string") {
    throw new Error(message);
  }

  return value;
}

function assertNumber(value: unknown, message: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(message);
  }

  return value;
}

function assertBoolean(value: unknown, message: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(message);
  }

  return value;
}

function sanitizeFileName(value: string) {
  const safeName = value
    .trim()
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return safeName || "profile";
}

function validateProfileSettings(value: unknown): ProfileSettingsState {
  const settings = assertRecord(value, "Invalid VisionUp profile JSON: settings missing.");

  const zoomSettings = assertRecord(
    settings.zoomSettings,
    "Invalid VisionUp profile JSON: zoom settings missing."
  );
  const readingSettings = assertRecord(
    settings.readingSettings,
    "Invalid VisionUp profile JSON: reading settings missing."
  );
  const shortcutSettingsValue = settings.shortcutSettings;
  const appSettings = assertRecord(
    settings.appSettings,
    "Invalid VisionUp profile JSON: app settings missing."
  );

  if (!Array.isArray(shortcutSettingsValue)) {
    throw new Error("Invalid VisionUp profile JSON: shortcut settings missing.");
  }

  return {
    zoomSettings: {
      zoomType: assertString(
        zoomSettings.zoomType,
        "Invalid VisionUp profile JSON: zoom type missing."
      ) as ProfileSettingsState["zoomSettings"]["zoomType"],
      maxZoom: assertNumber(
        zoomSettings.maxZoom,
        "Invalid VisionUp profile JSON: max zoom missing."
      ),
      smoothZoomEnabled: assertBoolean(
        zoomSettings.smoothZoomEnabled,
        "Invalid VisionUp profile JSON: smooth zoom flag missing."
      ),
      fastZoomEnabled: assertBoolean(
        zoomSettings.fastZoomEnabled,
        "Invalid VisionUp profile JSON: fast zoom flag missing."
      ),
    },
    readingSettings: {
      isEnabled: assertBoolean(
        readingSettings.isEnabled,
        "Invalid VisionUp profile JSON: reading enabled flag missing."
      ),
      textSize: assertNumber(
        readingSettings.textSize,
        "Invalid VisionUp profile JSON: text size missing."
      ),
      lineHeight: assertNumber(
        readingSettings.lineHeight,
        "Invalid VisionUp profile JSON: line height missing."
      ),
      letterSpacing: assertNumber(
        readingSettings.letterSpacing,
        "Invalid VisionUp profile JSON: letter spacing missing."
      ),
      readingWidth: assertNumber(
        readingSettings.readingWidth,
        "Invalid VisionUp profile JSON: reading width missing."
      ),
      backgroundMode: assertString(
        readingSettings.backgroundMode,
        "Invalid VisionUp profile JSON: background mode missing."
      ) as ProfileSettingsState["readingSettings"]["backgroundMode"],
    },
    shortcutSettings: shortcutSettingsValue.map((shortcut, index) => {
      const shortcutRecord = assertRecord(
        shortcut,
        `Invalid VisionUp profile JSON: shortcut ${index + 1} is invalid.`
      );

      return {
        id: assertString(
          shortcutRecord.id,
          `Invalid VisionUp profile JSON: shortcut ${index + 1} id missing.`
        ),
        group: assertString(
          shortcutRecord.group,
          `Invalid VisionUp profile JSON: shortcut ${index + 1} group missing.`
        ) as ProfileSettingsState["shortcutSettings"][number]["group"],
        action: assertString(
          shortcutRecord.action,
          `Invalid VisionUp profile JSON: shortcut ${index + 1} action missing.`
        ),
        defaultShortcut: assertString(
          shortcutRecord.defaultShortcut,
          `Invalid VisionUp profile JSON: shortcut ${index + 1} default shortcut missing.`
        ),
        fixedKeys: assertString(
          shortcutRecord.fixedKeys,
          `Invalid VisionUp profile JSON: shortcut ${index + 1} fixed keys missing.`
        ),
        customKey:
          typeof shortcutRecord.customKey === "string" ? shortcutRecord.customKey : "",
      };
    }),
    appSettings: {
      accessibilityIntegration: assertBoolean(
        appSettings.accessibilityIntegration,
        "Invalid VisionUp profile JSON: accessibility integration flag missing."
      ),
      startOnLogin: assertBoolean(
        appSettings.startOnLogin,
        "Invalid VisionUp profile JSON: start on login flag missing."
      ),
      defaultUiScale: assertNumber(
        appSettings.defaultUiScale,
        "Invalid VisionUp profile JSON: default UI scale missing."
      ),
      highContrastUi: assertBoolean(
        appSettings.highContrastUi,
        "Invalid VisionUp profile JSON: high contrast UI flag missing."
      ),
      reduceMotion: assertBoolean(
        appSettings.reduceMotion,
        "Invalid VisionUp profile JSON: reduce motion flag missing."
      ),
    },
  };
}

export function createProfileExportJson(
  profileName: string,
  settings: ProfileSettingsState
) {
  const exportData: VisionUpProfileExport = {
    app: "VisionUp",
    schemaVersion: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      name: profileName,
    },
    settings,
  };

  return JSON.stringify(exportData, null, 2);
}

export function parseImportedProfileJson(jsonText: string): ImportedProfileJson {
  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new Error("Invalid JSON file.");
  }

  const root = assertRecord(parsedJson, "Invalid VisionUp profile JSON.");

  if (root.app !== "VisionUp") {
    throw new Error("This file is not a VisionUp profile export.");
  }

  if (root.schemaVersion !== 1) {
    throw new Error("Unsupported VisionUp profile JSON version.");
  }

  const profile = assertRecord(
    root.profile,
    "Invalid VisionUp profile JSON: profile missing."
  );

  return {
    profileName: assertString(
      profile.name,
      "Invalid VisionUp profile JSON: profile name missing."
    ),
    settings: validateProfileSettings(root.settings),
  };
}

export function toProfileExportFileName(profileName: string) {
  const name = sanitizeFileName(profileName);
  const date = new Date().toISOString().slice(0, 10);

  return `visionup-${name}-${date}.json`;
}

export function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read selected JSON file."));
    reader.readAsText(file);
  });
}
