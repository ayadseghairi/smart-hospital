// src/components/common/Avatar.jsx
// Renders a circular initials avatar when a photo is not available.
// Never uses placeholder image services.

/**
 * Extracts up to 2 initials from a full name.
 * Works with Arabic and Latin names.
 */
function getInitials(fullName) {
  if (!fullName) return "؟"
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Fixed palette — one color per letter bucket so the same name always
// maps to the same color without runtime string interpolation (no Tailwind purge issue).
const PALETTE = [
  { bg: "bg-blue-600", text: "text-white" },
  { bg: "bg-green-600", text: "text-white" },
  { bg: "bg-purple-600", text: "text-white" },
  { bg: "bg-teal-600", text: "text-white" },
  { bg: "bg-indigo-600", text: "text-white" },
  { bg: "bg-rose-600", text: "text-white" },
  { bg: "bg-amber-600", text: "text-white" },
  { bg: "bg-cyan-600", text: "text-white" },
]

function colorFor(name) {
  const code = (name || "").charCodeAt(0) || 0
  return PALETTE[code % PALETTE.length]
}

const SIZE_CLASSES = {
  xs: "w-8 h-8 text-xs",
  sm: "w-10 h-10 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
  "2xl": "w-32 h-32 text-4xl",
}

/**
 * Avatar component.
 *
 * Props:
 *   src       – image URL (optional; falsy → show initials)
 *   name      – full name used for initials and alt text
 *   size      – "xs" | "sm" | "md" | "lg" | "xl" | "2xl"  (default: "md")
 *   className – extra Tailwind classes
 */
const Avatar = ({ src, name = "", size = "md", className = "" }) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md
  const color = colorFor(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    )
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold select-none flex-shrink-0 ${color.bg} ${color.text} ${sizeClass} ${className}`}
      aria-label={name}
      title={name}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar
