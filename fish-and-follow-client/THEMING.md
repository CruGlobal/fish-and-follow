# Fish & Follow - Theme Customization Guide

## Overview
The Fish & Follow application uses a centralized theming system that makes it easy to change colors and styling across the entire application.

## Theme Configuration

### 🎨 Main Theme Colors
All theme colors are defined in `/app/app.css` as CSS custom properties:

```css
:root {
  /* App Theme Colors - Change these to customize the entire app theme */
  --app-bg-from: #CDF5FD;     /* Background gradient start color */
  --app-bg-to: #ffffff;       /* Background gradient end color */
  --brand-primary: #00A9FF;   /* Primary brand color (buttons, links) */
  --brand-secondary: #89CFF3; /* Secondary brand color */
  --brand-accent: #A0E9FF;    /* Accent color for highlights */
}
```

### 🛠️ How to Change the App Theme

#### To change the background color:
1. Open `/app/app.css`
2. Modify `--app-bg-from` and `--app-bg-to` variables
3. The background will automatically update across all pages

#### To change brand colors:
1. Update `--brand-primary`, `--brand-secondary`, and `--brand-accent`
2. Colors will automatically apply to buttons, gradients, and brand elements

### 📱 Utility Classes

The theming system provides these utility classes:

| Class | Description | Usage |
|-------|-------------|-------|
| `.app-bg` | Main app background gradient | Applied to page containers |
| `.brand-gradient` | Primary to secondary gradient | Buttons, call-to-action elements |
| `.brand-gradient-reverse` | Secondary to primary gradient | Hover effects |
| `.brand-gradient-accent` | Secondary to accent gradient | Special highlights |

### 🎯 Usage Examples

#### Page Background
```tsx
<div className="min-h-screen app-bg">
  {/* Page content */}
</div>
```

#### Branded Button
```tsx
<button className="brand-gradient text-white px-4 py-2 rounded-lg">
  Click Me
</button>
```

#### Using CSS Custom Properties in Tailwind
```tsx
<div 
  className="w-12 h-12 rounded-xl" 
  style={{ backgroundColor: 'var(--brand-primary)' }}
>
  Icon
</div>
```

### 🗂️ Files Using the Theme System

#### Main Layout Files:
- `/app/root.tsx` - Root layout with global background
- `/app/components/Layout.tsx` - Alternative layout component

#### Page Files:
- `/app/routes/admin.tsx`
- `/app/routes/home.tsx` 
- `/app/routes/contact-form.tsx`
- `/app/routes/contacts.tsx`
- `/app/routes/qr.tsx`
- `/app/routes/login.tsx`

#### Component Files:
- `/app/components/ModernNavigation.tsx` - Navigation with brand colors
- `/app/components/UsersTable.tsx` - Admin table with themed elements

### 🔄 Quick Theme Changes

#### Business/Corporate Theme:
```css
--app-bg-from: #f8fafc;
--app-bg-to: #e2e8f0;
--brand-primary: #3b82f6;
--brand-secondary: #60a5fa;
--brand-accent: #93c5fd;
```

#### Ocean Theme (Current):
```css
--app-bg-from: #CDF5FD;
--app-bg-to: #ffffff;
--brand-primary: #00A9FF;
--brand-secondary: #89CFF3;
--brand-accent: #A0E9FF;
```

#### Sunset Theme:
```css
--app-bg-from: #fed7aa;
--app-bg-to: #ffffff;
--brand-primary: #f97316;
--brand-secondary: #fb923c;
--brand-accent: #fdba74;
```

### 💡 Best Practices

1. **Always use the utility classes** when possible instead of hardcoded Tailwind colors
2. **Test accessibility** - ensure sufficient contrast ratios when changing colors
3. **Update both light colors** - maintain the gradient effect for visual consistency
4. **Consider hover states** - use reverse gradients for interactive elements

### 🚀 Future Enhancements

Consider adding:
- Dark mode support with CSS custom properties
- Multiple theme presets (business, creative, minimal)
- Theme switcher component for user preferences
- CSS-in-JS theme provider for advanced customization

---

**Note**: Changes to CSS custom properties take effect immediately without rebuilding the application.
