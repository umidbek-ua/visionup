# VisionUp v0.1 Architecture

## Goal

Deliver a stable MVP focused on zoom, profiles, shortcuts, and reading support.

---

# Technology Stack

Frontend:

* React
* TypeScript

Desktop Runtime:

* Tauri

Core Layer:

* Rust

Platform:

* macOS

---

# High-Level Architecture

┌──────────────────────┐
│       User           │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│     React UI         │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│   Tauri Commands     │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│     Rust Core        │
└──────────┬───────────┘
│
▼
┌──────────────────────┐
│     macOS APIs       │
└──────────────────────┘

---

# Modules

## UI Module

Responsibilities:

* Settings
* Profiles
* Shortcut configuration
* Accessibility controls

Technology:

* React
* TypeScript

---

## Zoom Module

Responsibilities:

* Zoom controls
* Magnification settings
* Zoom profiles

Technology:

* Rust
* macOS APIs

---

## Profile Module

Responsibilities:

* Create profiles
* Save profiles
* Load profiles
* Switch profiles

Technology:

* Rust
* Local storage

---

## Shortcut Module

Responsibilities:

* Global shortcuts
* Custom shortcuts
* Action mapping

Technology:

* Rust

---

## Reading Module

Responsibilities:

* Reading mode
* Font adjustments
* Reading enhancements

Technology:

* Rust
* React

---

# Data Storage

Version 0.1:

Local configuration files

Example:

profiles.json

settings.json

shortcuts.json

---

# MVP Scope

Included:

* Fast Zoom
* Smooth Zoom
* Profiles
* Custom Shortcuts
* Reading Mode

Excluded:

* OCR
* AI Assistant
* Smart Focus Tracking
* Secondary Zoom Display

---

# Research Scope

Requires investigation before implementation:

* Secondary Zoom Display
* Zoom Follow Cursor
* Zoom Follow Focus
* Smart Dark Background Engine

---

# Future Architecture

Future versions may include:

* OCR Engine
* AI Assistant
* Automation Rules
* Workspace Profiles
* Cross-platform support

Phase 1:
macOS

Phase 2:
Windows

Phase 3:
Linux

