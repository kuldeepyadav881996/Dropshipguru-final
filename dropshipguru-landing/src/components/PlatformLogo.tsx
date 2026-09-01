import type { CSSProperties } from "react";

export type PlatformId =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "social"
  | "meesho"
  | "flipkart"
  | "amazon-in"
  | "amazon-com"
  | "shopify"
  | "website";

const ICON_SIZE = 24;
const BOX_SIZE = 44;
const DUAL_ICON_SIZE = 18;

type PlatformLogoProps = {
  platform: PlatformId;
  className?: string;
  style?: CSSProperties;
  /** When true, renders icon only (24px) without the 44px container box */
  bare?: boolean;
};

function AmazonLogo() {
  return (
    <svg
      className="brand-icon-svg"
      viewBox="0 0 24 24"
      width={ICON_SIZE}
      height={ICON_SIZE}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <path
        fill="#FF9900"
        d="M13.2 13.8c-2.9 2.1-6.8 3.2-9.8 3.2-4.2 0-4.7-.1-4.7-.5 0-.3.3-2.1 1.3-3.9 1.2-2.1 2.8-3.6 4.7-4.4.3-.2.6 0 .5.3-.2.6-.7 2-.7 3 0 1.1.6 2.2 1.9 2.2 1.1 0 2.2-.6 3.1-1.5l-1.3-5H5.8l.3-1h7.5l1 3.7z"
      />
      <path
        fill="#FF9900"
        d="M17.2 18.5c-3.4 2.5-8 3.8-11.7 3.8-.4 0-.7 0-1-.1 3.6 2.1 8.3 3.3 13 3.3 5.3 0 9.8-1.2 13.5-3.3-.3.1-.6.1-1 .1-3.7 0-8.3-1.3-11.8-3.8z"
      />
    </svg>
  );
}

function WebsiteLogo() {
  return (
    <svg
      className="brand-icon-svg"
      viewBox="0 0 24 24"
      width={ICON_SIZE}
      height={ICON_SIZE}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#D4AF37" strokeWidth="1.5" />
      <path d="M3 9.5h18" stroke="#D4AF37" strokeWidth="1.4" />
      <circle cx="6.2" cy="7.3" r=".75" fill="#D4AF37" />
      <circle cx="8.8" cy="7.3" r=".75" fill="#D4AF37" />
      <circle cx="11.4" cy="7.3" r=".75" fill="#D4AF37" />
      <rect x="7" y="12.5" width="10" height="4" rx="1" stroke="#D4AF37" strokeWidth="1.2" />
    </svg>
  );
}

function renderLogo(platform: PlatformId, gradientId: string, dual = false) {
  const size = dual ? DUAL_ICON_SIZE : ICON_SIZE;

  switch (platform) {
    case "whatsapp":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            fill="#25D366"
            d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"
          />
        </svg>
      );
    case "instagram":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FD5949" />
              <stop offset="50%" stopColor="#D6249F" />
              <stop offset="100%" stopColor="#285AEB" />
            </linearGradient>
          </defs>
          <rect x="2" y="2" width="20" height="20" rx="5" fill={`url(#${gradientId})`} />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.6" />
          <circle cx="17.4" cy="6.6" r="1.2" fill="#fff" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            fill="#1877F2"
            d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"
          />
        </svg>
      );
    case "social":
      return (
        <div
          className="social-dual-icons"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            width: BOX_SIZE,
            maxWidth: BOX_SIZE,
            overflow: "visible",
            flexShrink: 0,
          }}
        >
          {renderLogo("instagram", `${gradientId}-ig`, true)}
          {renderLogo("facebook", `${gradientId}-fb`, true)}
        </div>
      );
    case "amazon-in":
    case "amazon-com":
      return (
        <div className="amazon-icon-stack">
          <AmazonLogo />
          <span className="amazon-market-badge">
            {platform === "amazon-com" ? "GLOBAL" : "IN"}
          </span>
        </div>
      );
    case "meesho":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            fill="#F43361"
            d="M4 4h6.5l1.8 12.5L12 20l-2.3-3.5L7.9 4H4zm10 0h6l-2.4 16h-3.1l.5-3.5h-3.8l-.6 3.5H9.5L12 4h2zm-1.2 9.5h3.3l.9-6h-3.3l-.9 6z"
          />
        </svg>
      );
    case "flipkart":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path fill="#2874F0" d="M4 18.5L7 5.5h3.2l2.2 8.2 2.3-8.2H18l-3 13H14l-2.4-8.5L9.2 18.5H4z" />
          <path fill="#F9D71C" d="M6.5 7.5h9.5l-.8 2.5H7.3l-.8-2.5z" />
        </svg>
      );
    case "shopify":
      return (
        <svg
          className="brand-icon-svg"
          viewBox="0 0 24 24"
          width={size}
          height={size}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          <path
            fill="#95BF47"
            d="M15.3 3.4l-.2 1.2c-.4-.1-.9-.2-1.5-.2-1.5 0-2.5.7-2.5 1.9 0 .8.5 1.3 1.3 1.7l-1.1 4.2h2.3l.8-3.1c.3.1.7.1 1 .1 1.5 0 2.5-.7 2.5-1.9 0-.7-.4-1.2-1.1-1.5l.5-2.3h-2zm-5.8 0L4.2 20.2h2.4l1.1-4.3.9 4.3h2.3l1.5-6.1c-.9-.3-1.5-.9-1.5-1.8 0-1.2 1-1.9 2.5-1.9.5 0 1 .1 1.4.2l.2-1.2H9.5z"
          />
        </svg>
      );
    case "website":
    default:
      return <WebsiteLogo />;
  }
}

let iconUid = 0;

export function PlatformLogo({ platform, className = "", style, bare = false }: PlatformLogoProps) {
  const gradientId = `pl-ig-${++iconUid}`;
  const box = bare ? ICON_SIZE : BOX_SIZE;

  return (
    <span
      className={`platform-icon platform-logo brand-icon-wrap ${className}`.trim()}
      data-icon={platform}
      aria-hidden
      style={{
        width: box,
        height: box,
        minWidth: box,
        minHeight: box,
        maxWidth: box,
        maxHeight: box,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        overflow: "visible",
        position: "relative",
        ...(bare
          ? {
              background: "transparent",
              border: "none",
              borderRadius: 0,
            }
          : {
              borderRadius: 14,
              background: "#1E232E",
              border: "1px solid rgba(212, 175, 55, 0.35)",
            }),
        ...style,
      }}
    >
      {renderLogo(platform, gradientId)}
    </span>
  );
}

export type PlatformLogoVariant = "card";

/** @deprecated Use PlatformLogo */
export const PlatformIcon = PlatformLogo;
