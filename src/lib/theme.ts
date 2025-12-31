/**
 * Sentra CMS Theme Configuration
 * Based on the Labs. design system
 */

export const theme = {
  colors: {
    // Backgrounds - ultra dark palette
    bg: {
      primary: "#0a0a0a", // Main app background
      secondary: "#0f0f0f", // Sidebar background
      surface: "#141414", // Cards, panels
      elevated: "#1a1a1a", // Hover states, elevated surfaces
      input: "#1c1c1c", // Input fields
      hover: "#222222", // Hover states
      active: "#2a2a2a", // Active/selected states
    },

    // Borders
    border: {
      subtle: "#1f1f1f", // Very subtle borders
      default: "#2a2a2a", // Default borders
      strong: "#3a3a3a", // Emphasized borders
    },

    // Text colors
    text: {
      primary: "#ffffff", // Headings, important text
      secondary: "#a1a1a1", // Body text, descriptions
      muted: "#6b6b6b", // Disabled, placeholder text
      inverse: "#0a0a0a", // Text on light backgrounds
    },

    // Accent - Light Blue #7CB2F8
    accent: {
      default: "#7CB2F8", // Primary accent (light blue)
      hover: "#9AC4FA", // Hover state (lighter)
      muted: "#7CB2F820", // Background tint
      subtle: "#7CB2F810", // Very subtle tint
    },

    // Status colors
    status: {
      live: "#22c55e", // Green - Live/Published
      liveBackground: "#22c55e15",
      review: "#f59e0b", // Amber - In Review
      reviewBackground: "#f59e0b15",
      draft: "#6b7280", // Gray - Draft
      draftBackground: "#6b728015",
      warning: "#f59e0b", // Warnings
      warningBackground: "#f59e0b15",
      error: "#ef4444", // Errors
      errorBackground: "#ef444415",
    },

    // Interactive elements
    interactive: {
      default: "#7CB2F8", // Light blue for links, buttons
      hover: "#9AC4FA",
    },
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    "4xl": "40px",
    "5xl": "48px",
    "6xl": "64px",
  },

  radius: {
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    "2xl": "16px",
    full: "9999px",
  },

  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", monospace',
    },
    fontSize: {
      xs: ["12px", { lineHeight: "16px" }],
      sm: ["13px", { lineHeight: "18px" }],
      base: ["14px", { lineHeight: "20px" }],
      lg: ["16px", { lineHeight: "24px" }],
      xl: ["18px", { lineHeight: "28px" }],
      "2xl": ["20px", { lineHeight: "28px" }],
      "3xl": ["24px", { lineHeight: "32px" }],
      "4xl": ["30px", { lineHeight: "36px" }],
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },

  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.3)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.5), 0 8px 10px -6px rgb(0 0 0 / 0.4)",
    glow: "0 0 20px rgba(124, 178, 248, 0.2)", // Accent glow
  },

  transitions: {
    fast: "150ms ease",
    default: "200ms ease",
    slow: "300ms ease",
  },

  // Sidebar specific
  sidebar: {
    width: "240px",
    collapsedWidth: "64px",
  },

  // Z-index scale
  zIndex: {
    dropdown: 50,
    sticky: 100,
    modal: 200,
    popover: 300,
    tooltip: 400,
  },
} as const;

// Type exports for TypeScript support
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
export type ThemeRadius = typeof theme.radius;

