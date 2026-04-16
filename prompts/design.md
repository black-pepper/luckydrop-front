# UI Design Specification: LuckDrop

This document outlines the visual identity, design systems, and component usage patterns for the LuckDrop project, derived from the actual implementation in the `src` directory.

## 1. Design Philosophy
LuckDrop maintains two distinct visual experiences tailored to their respective audiences:
- **User Side (Participant):** Focuses on a "Joyful & Playful" experience. It uses soft pastel colors, rounded corners (1rem), and expressive animations to create a sense of excitement and reward.
- **Admin Side (Management):** Focuses on a "Professional & Productive" experience. It employs a dark-themed sidebar, neutral backgrounds, and clear visual hierarchies to ensure efficiency in content management.

## 2. Color System
The project uses HSL (Hue, Saturation, Lightness) variables for flexible and consistent styling.

### 2.1 User Side Palette
- **Primary:** Rose/Pink (`hsl(340 65% 65%)`) - Used for primary actions and branding.
- **Secondary:** Mint (`hsl(170 45% 75%)`) - Used for success states and secondary elements.
- **Background:** Soft Warm White (`hsl(30 50% 97%)`) - Provides a clean, paper-like feel.
- **Foreground:** Dark Charcoal (`hsl(260 20% 25%)`) - High contrast for readability.
- **Accents (Pastels):**
    - Mint: `hsl(170 45% 75%)`
    - Lavender: `hsl(270 50% 80%)`
    - Peach: `hsl(20 80% 82%)`
    - Lemon: `hsl(50 80% 82%)`
    - Sky: `hsl(200 70% 82%)`

### 2.2 Admin Side Palette
- **Background:** Cool Gray (`hsl(220 20% 97%)`)
- **Sidebar:** Dark Slate (`hsl(220 25% 18%)`)
- **Sidebar Foreground:** Light Gray (`hsl(220 10% 90%)`)
- **Accent (Blue):** `hsl(220 60% 55%)`
- **Border:** `hsl(220 15% 88%)`

## 3. Typography
- **Font Family:** `Nunito`, sans-serif (imported from Google Fonts).
- **Style:** Modern, rounded typeface that complements the playful design.
- **Scale:**
    - Headers: Large, bold (`font-bold`, `tracking-tight`).
    - Body: Standard sizing (`text-sm`, `text-base`).
    - Helper Text: Muted and slightly smaller (`text-xs`, `text-muted-foreground`).

## 4. Layout & Spacing
- **Border Radius:** Default `--radius` is set to `1rem` (16px), creating a friendly, modern look.
- **Shadows:**
    - Soft Shadow: `0 4px 24px -4px hsl(340 65% 65% / 0.15)` - Used for primary user cards.
    - Card Shadow: `0 2px 16px -2px hsl(260 20% 50% / 0.1)` - Used for standard cards.
- **Containers:**
    - User Side: Centered layouts (e.g., `max-w-sm` for DrawBox).
    - Admin Side: Sidebar-driven with a max-width of `5xl` for the main content area.

## 5. Animations & Motion
The project features a rich set of custom CSS animations to enhance interactivity.
- **`animate-shake`:** Used during the "shaking" phase of the draw box.
- **`animate-sparkle`:** Adds a glowing effect to winning or interactive elements.
- **`animate-bounce-in`:** For entry animations of cards and components.
- **`animate-pop`:** A quick scale animation for immediate feedback.
- **`animate-float`:** A subtle up-and-down motion for idle interactive elements.
- **`animate-confetti`:** Used for celebrating a winning result.

## 6. Component Patterns
- **Cards:** White backgrounds with soft shadows and rounded corners.
- **Buttons:**
    - User: Colorful, animated, and tactile (e.g., DrawBox emoji button).
    - Admin: Professional, clear icons (Lucide React), and clean hover states.
- **Feedback:**
    - `sonner`: Used for modern, toast-style notifications.
    - `toaster`: Used for standard Radix-based toast notifications.
- **Navigation:**
    - Simple back buttons and progress indicators for the user flow.
    - Consistent sidebar navigation with active/inactive states for the admin area.
