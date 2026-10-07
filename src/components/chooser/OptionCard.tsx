import { asset } from "@/lib/asset";
import type { ChooserOption } from "./options";

/**
 * One option on the chooser. The thumbnail frame shows the hero shot; on
 * hover or keyboard focus a tall page capture (lazy loaded, same top frame)
 * pans slowly down inside it.
 *
 * Links are plain anchors on purpose: every option boots with a full page
 * load, so its pre-paint head script, preloader and intro run exactly as on a
 * direct visit.
 */
export default function OptionCard({ option, index }: { option: ChooserOption; index: number }) {
  const href = asset(`/${option.slug}/`);
  const thumb = option.thumb ?? option.slug;
  const titleId = `opt-${option.slug}`;

  return (
    <li className="ch-card" style={{ "--i": index } as React.CSSProperties}>
      <article className="ch-card-frame px-corners" aria-labelledby={titleId}>
        <div className="ch-card-in px-corners">
          <a href={href} className="ch-thumb" tabIndex={-1} aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP */}
            <img src={asset(`/chooser/${thumb}.webp`)} alt="" width={720} height={450} decoding="async" className="ch-thumb-hero" />
            {/* eslint-disable-next-line @next/next/no-img-element -- static export, pre-sized WebP */}
            <img src={asset(`/chooser/${thumb}-tall.webp`)} alt="" width={720} height={1800} loading="lazy" decoding="async" className="ch-thumb-tall" />
          </a>

          <div className="ch-body">
            <div className="ch-meta">
              <span className="font-px t-px1 text-merlot">Option {option.number}</span>
              {option.badge ? <span className="ch-badge font-px t-px1 px-corners">{option.badge}</span> : null}
            </div>
            <h2 id={titleId} className="ch-name">
              {option.name}
            </h2>
            <p className="ch-desc">{option.description}</p>
            <ul className="ch-tags" aria-label="Tags">
              {option.tags.map((t) => (
                <li key={t} className="ch-tag px-corners">
                  {t}
                </li>
              ))}
            </ul>
            <div className="ch-actions">
              <a href={href} className="btn btn-merlot roll-host ch-open" aria-label={`Open option ${option.number}, ${option.name}`}>
                <span className="roll">
                  <span>Open</span>
                  <span aria-hidden="true">Open</span>
                </span>
                <span className="arrow" aria-hidden="true" />
              </a>
              <span className="ch-path font-px t-px1" aria-hidden="true">
                /{option.slug}/
              </span>
            </div>
          </div>
        </div>
      </article>
    </li>
  );
}
