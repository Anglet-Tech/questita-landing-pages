import type { CSSProperties, ReactNode } from "react";

/**
 * One poster on the wall. A zero-height anchor sits in normal flow right
 * before it, so in-page links and scroll triggers always measure the poster's
 * flow position, even while the poster itself is stuck under the next one.
 */
export default function Poster({
  id,
  labelledBy,
  paper,
  light = false,
  first = false,
  stick = true,
  as: Tag = "section",
  className = "",
  paperClassName = "",
  paperStyle,
  outside,
  fill = true,
  frame = false,
  children,
}: {
  id: string;
  labelledBy?: string;
  paper: string;
  light?: boolean;
  first?: boolean;
  stick?: boolean;
  as?: "section" | "footer";
  className?: string;
  paperClassName?: string;
  paperStyle?: CSSProperties;
  /** Rendered inside the poster but outside (under) the paper, e.g. a peeking fox. */
  outside?: ReactNode;
  /** At least one screen tall, content centred. */
  fill?: boolean;
  /** A merlot frame inset on the paper, like the board poster's card. */
  frame?: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <span id={id} className="wl-anchor" data-anchor="" />
      <Tag
        data-poster=""
        data-stick={stick || undefined}
        data-first={first || undefined}
        aria-labelledby={labelledBy}
        className={`wl-poster ${light ? "wl-light" : "on-dark"} ${className}`}
      >
        {outside}
        <div className={`wl-paper ${fill ? "wl-fill" : ""} ${paperClassName}`} style={{ "--paper": paper, ...paperStyle } as CSSProperties}>
          {!first && <div className="wl-drips" data-drips="" aria-hidden="true" />}
          {frame && <div className="wl-frame" aria-hidden="true" />}
          {children}
        </div>
      </Tag>
    </>
  );
}
