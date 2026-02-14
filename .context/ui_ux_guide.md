# UI/UX & Mobile Responsiveness Guide

This guide documents the core UI patterns, mobile responsiveness strategies, and component usage in the application. It serves as a reference for implementing similar features in other applications.

## 1. Mobile Responsiveness Strategy

The application adopts a **Tailwind-first** approach for responsive design, prioritizing mobile layouts.

### Strict Breakpoint Usage

New components should default to mobile styles and use `md:` or `lg:` prefixes for desktop overrides.

```tsx
// Example: Hidden on mobile, Flex on desktop
<div className="hidden md:flex">
  <Sidebar />
</div>
```

### Safe Area Handling

To ensure content is accessible on modern mobile devices (especially iOS with home indicators), we utilize CSS environment variables natively supported by Tailwind (or via custom config).

- **Bottom Navigation**: Add padding to avoid overlap with the home indicator.

```tsx
<div className="pb-[env(safe-area-inset-bottom)] ...">
```

## 2. Bottom Navigation (`BottomNav`)

The `MobileBottomNav` component is critical for mobile navigation. It is fixed to the bottom of the viewport and visible only on mobile screens.

### Implementation Checklist

1. **Fixed Positioning**: `fixed bottom-0 left-0 right-0 z-50`
2. **Safe Area**: `pb-[env(safe-area-inset-bottom)]`
3. **Visibility**: `md:hidden` (Hide on desktop)
4. **Active State**: Highlight the active tab icon and label.

### Component Structure

```tsx
import { usePathname } from "next/navigation";
import { Link } from "next/link";
import { Home2, Setting2 } from "iconsax-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  // ... navItems array definition

  return (
    <div className="fixed bottom-0 z-50 w-full bg-background border-t pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex justify-around h-16 items-center">
        {navItems.map((item) => (
          <Link
            href={item.href}
            className={cn(
              "flex flex-col items-center",
              item.isActive ? "text-primary" : "text-muted-foreground",
            )}
          >
            <item.icon variant={item.isActive ? "Bulk" : "TwoTone"} />
            <span className="text-[10px]">{item.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

## 3. Icon System (`iconsax-react`)

We use **Iconsax** for a consistent and premium icon set.

### Usage Rules

- **Import**: `import { IconName } from "iconsax-react";`
- **Default Style**: `variant="TwoTone"` or `variant="Outline"` for inactive/default states.
- **Active User Style**: `variant="Bulk"` or `variant="Bold"` for active/selected states.
- **Color**: Always use `color="currentColor"` to inherit text color from the parent (Tailwind classes).
- **Size**: Standard sizes are `16`, `20`, `24`.

### Example

```tsx
<Home2 size={24} color="currentColor" variant={isActive ? "Bulk" : "TwoTone"} />
```

## 4. Opt-in UI Features

"Opt-in" features allow users to enable specific functionality or integrations (like "Beta Features" or "Notification Channels").

### Pattern: Feature Flags (Switches)

Use a togglable switch to enable/disable features. This is often persisted to a user settings or preferences database model.

```tsx
<div className="flex items-center justify-between">
  <div>
    <h4>Beta Navigation</h4>
    <p className="text-sm text-muted">Try the new sidebar layout.</p>
  </div>
  <Switch
    checked={preferences.featureFlags.newNav}
    onCheckedChange={(checked) => updatepreference("newNav", checked)}
  />
</div>
```

### Pattern: Integration Channels (Dynamic Lists)

For connecting external services (e.g., Slack, Telegram, Discord), use a dynamic list pattern:

1. **List existing connections**: Show status (Connected/Disconnected).
2. **Add Button**: Allow adding new instances.
3. **Configuration Form**: Show inputs for API keys/Webhooks only when adding/editing.

#### Visual Indicators

- **Connected**: Green dot or "Connected" badge.
- **Action**: "Connect" button for OAuth flows (e.g., Slack) or Input fields for Manual Token entry (e.g., Telegram).

```tsx
// Example: Connected State
<div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-xs flex items-center gap-2">
  <TickCircle size={14} variant="Bulk" />
  <span>Connected to Workspace</span>
</div>
```

## 5. Theme & Styling

- **Dark Mode**: Supported via `dark:` variant and CSS variables.
- **Colors**: Defined in `globals.css` using `oklch` for wider color gamut support.
- **Borders**: Subtle borders (`border-border`) combined with `bg-card` for effective separation in both light and dark modes.
