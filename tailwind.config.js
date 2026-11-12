/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}", "./src/**/*.{js,jsx,ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
    theme: {
      extend: {
        fontFamily: {
          cairo: ["Cairo", "sans-serif"],
          sans: ["Inter", "system-ui", "sans-serif"],
        },
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "hsl(var(--background))",
          foreground: "hsl(var(--foreground))",
          primary: {
            DEFAULT: "hsl(var(--primary))",
            foreground: "hsl(var(--primary-foreground))",
            50: "#eff6ff",
            100: "#dbeafe",
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#3b82f6",
            600: "#2563eb",
            700: "#1d4ed8",
            800: "#1e40af",
            900: "#1e3a8a",
          },
          secondary: {
            DEFAULT: "hsl(var(--secondary))",
            foreground: "hsl(var(--secondary-foreground))",
            50: "#ecfdf5",
            100: "#d1fae5",
            200: "#a7f3d0",
            300: "#6ee7b7",
            400: "#34d399",
            500: "#10b981",
            600: "#059669",
            700: "#047857",
            800: "#065f46",
            900: "#064e3b",
          },
          destructive: {
            DEFAULT: "hsl(var(--destructive))",
            foreground: "hsl(var(--destructive-foreground))",
          },
          muted: {
            DEFAULT: "hsl(var(--muted))",
            foreground: "hsl(var(--muted-foreground))",
          },
          accent: {
            DEFAULT: "hsl(var(--accent))",
            foreground: "hsl(var(--accent-foreground))",
          },
          popover: {
            DEFAULT: "hsl(var(--popover))",
            foreground: "hsl(var(--popover-foreground))",
          },
          card: {
            DEFAULT: "hsl(var(--card))",
            foreground: "hsl(var(--card-foreground))",
          },
          medical: {
            blue: "#3b82f6",
            green: "#10b981",
            red: "#ef4444",
            purple: "#8b5cf6",
            yellow: "#f59e0b",
            pink: "#ec4899",
            orange: "#f97316",
            teal: "#14b8a6",
            indigo: "#6366f1",
            cyan: "#06b6d4",
          },
          success: {
            50: "#ecfdf5",
            100: "#d1fae5",
            500: "#10b981",
            600: "#059669",
          },
          warning: {
            50: "#fffbeb",
            100: "#fef3c7",
            500: "#f59e0b",
            600: "#d97706",
          },
          error: {
            50: "#fef2f2",
            100: "#fee2e2",
            500: "#ef4444",
            600: "#dc2626",
          },
          info: {
            50: "#eff6ff",
            100: "#dbeafe",
            500: "#3b82f6",
            600: "#2563eb",
          },
        },
        animation: {
          "fade-in": "fadeIn 0.5s ease-out",
          "fade-in-up": "fadeInUp 0.6s ease-out",
          "slide-in-right": "slideInRight 0.5s ease-out",
          "slide-in-left": "slideInLeft 0.5s ease-out",
          "slide-up": "slideUp 0.4s ease-out",
          "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
          "bounce-slow": "bounce 2s infinite",
          "emergency-pulse": "emergency-pulse 1s infinite",
          float: "float 3s ease-in-out infinite",
          glow: "glow 2s ease-in-out infinite alternate",
          shimmer: "shimmer 2s linear infinite",
          "spin-slow": "spin 3s linear infinite",
          wiggle: "wiggle 1s ease-in-out infinite",
        },
        keyframes: {
          fadeIn: {
            "0%": { opacity: "0", transform: "translateY(10px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          fadeInUp: {
            "0%": { opacity: "0", transform: "translateY(30px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          slideInRight: {
            "0%": { opacity: "0", transform: "translateX(30px)" },
            "100%": { opacity: "1", transform: "translateX(0)" },
          },
          slideInLeft: {
            "0%": { opacity: "0", transform: "translateX(-30px)" },
            "100%": { opacity: "1", transform: "translateX(0)" },
          },
          slideUp: {
            "0%": { opacity: "0", transform: "translateY(20px)" },
            "100%": { opacity: "1", transform: "translateY(0)" },
          },
          "emergency-pulse": {
            "0%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0.7)" },
            "70%": { boxShadow: "0 0 0 10px rgba(239, 68, 68, 0)" },
            "100%": { boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)" },
          },
          float: {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-10px)" },
          },
          glow: {
            "0%": { boxShadow: "0 0 5px rgba(59, 130, 246, 0.5)" },
            "100%": { boxShadow: "0 0 20px rgba(59, 130, 246, 0.8)" },
          },
          shimmer: {
            "0%": { transform: "translateX(-100%)" },
            "100%": { transform: "translateX(100%)" },
          },
          wiggle: {
            "0%, 100%": { transform: "rotate(-3deg)" },
            "50%": { transform: "rotate(3deg)" },
          },
        },
        boxShadow: {
          colored: "0 10px 25px rgba(59, 130, 246, 0.15)",
          medical: "0 4px 20px rgba(59, 130, 246, 0.1)",
          "medical-lg": "0 8px 30px rgba(59, 130, 246, 0.2)",
          "glow-blue": "0 0 20px rgba(59, 130, 246, 0.3)",
          "glow-green": "0 0 20px rgba(16, 185, 129, 0.3)",
          "glow-red": "0 0 20px rgba(239, 68, 68, 0.3)",
          "inner-light": "inset 0 2px 4px 0 rgba(255, 255, 255, 0.1)",
        },
        backdropBlur: {
          xs: "2px",
        },
        borderRadius: {
          lg: "var(--radius)",
          md: "calc(var(--radius) - 2px)",
          sm: "calc(var(--radius) - 4px)",
        },
        spacing: {
          18: "4.5rem",
          88: "22rem",
          128: "32rem",
        },
        fontSize: {
          "2xs": "0.625rem",
          "3xl": "1.875rem",
          "4xl": "2.25rem",
          "5xl": "3rem",
          "6xl": "3.75rem",
        },
        zIndex: {
          60: "60",
          70: "70",
          80: "80",
          90: "90",
          100: "100",
        },
        screens: {
          xs: "475px",
          "3xl": "1600px",
        },
        transitionDuration: {
          400: "400ms",
          600: "600ms",
          800: "800ms",
          900: "900ms",
        },
        transitionTimingFunction: {
          "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
          smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    plugins: [],
    darkMode: "class",
  }
  
// Note: overflow-wrap-anywhere is a custom utility added via index.css
  