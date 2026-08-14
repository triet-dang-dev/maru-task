"use client";

import { designTokens } from "@/theme/tokens";

interface GlobalErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorPage({ error, reset }: GlobalErrorPageProps) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            alignItems: "center",
            background: designTokens.color.neutral[0],
            color: designTokens.color.neutral[800],
            display: "flex",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
            justifyContent: "center",
            minHeight: "100dvh",
            padding: "48px 24px",
          }}
        >
          <section
            style={{
              background: "#ffffff",
              border: `1px solid ${designTokens.color.neutral[200]}`,
              borderRadius: designTokens.radius.md,
              maxWidth: 560,
              padding: 24,
              width: "100%",
            }}
          >
            <p style={{ color: designTokens.color.brand[600], fontSize: 14, fontWeight: 600, margin: "0 0 8px" }}>
              Application error
            </p>
            <h1 style={{ fontSize: 32, lineHeight: 1.2, margin: "0 0 12px" }}>
              The app needs a quick reset
            </h1>
            <p style={{ color: designTokens.color.neutral[600], fontSize: 16, lineHeight: 1.5, margin: "0 0 20px" }}>
              A global boundary caught an unexpected failure before the route could render.
            </p>
            {error.digest ? (
              <p style={{ color: designTokens.color.neutral[600], fontFamily: "monospace", fontSize: 12 }}>
                Error digest: {error.digest}
              </p>
            ) : null}
            <button
              onClick={reset}
              style={{
                background: designTokens.color.brand[600],
                border: 0,
                borderRadius: designTokens.radius.md,
                color: "#ffffff",
                cursor: "pointer",
                fontSize: 14,
                fontWeight: 600,
                minHeight: 36,
                padding: "8px 12px",
              }}
              type="button"
            >
              Reset app
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
