"use client";

import { useEffect, useRef, useState } from "react";
import { FORM_ACCESS_KEY, FORM_FROM_NAME, FORM_SUBJECT, PARTNERSHIPS_EMAIL } from "@/config";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { stairClip } from "@/lib/stairs";
import { CONTACT_EVENT, setScrollLock } from "@/lib/store";
import PixelFox from "./PixelFox";
import { Roll } from "./ui";

type Status = "idle" | "sending" | "success" | "error";
type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;

const MESSAGES: Record<Field, string> = {
  name: "Add your name so we know who to reply to.",
  email: "That email doesn’t look right.",
  message: "Tell us a little about what you have in mind.",
};

function validate(data: FormData): Errors {
  const e: Errors = {};
  if (!String(data.get("name") ?? "").trim()) e.name = MESSAGES.name;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.get("email") ?? "").trim())) e.email = MESSAGES.email;
  if (!String(data.get("message") ?? "").trim()) e.message = MESSAGES.message;
  return e;
}

/** Native <dialog> contact form. Every "Get in touch" control opens it. */
export default function ContactModal() {
  const dialog = useRef<HTMLDialogElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onOpen = () => {
      if (d.open) return;
      lastFocus.current = document.activeElement as HTMLElement | null;
      setStatus((s) => (s === "success" || s === "error" ? "idle" : s));
      d.showModal();
      setScrollLock("modal", true);
      if (!prefersReducedMotion() && card.current) {
        const p = { v: 0 };
        gsap.to(p, {
          v: 1,
          duration: 0.45,
          ease: "power2.out",
          onUpdate: () => {
            if (card.current) card.current.style.clipPath = stairClip(p.v, 8);
          },
          onComplete: () => {
            if (card.current) card.current.style.clipPath = "";
          },
        });
      }
    };
    const onClose = () => {
      setScrollLock("modal", false);
      lastFocus.current?.focus?.();
    };
    window.addEventListener(CONTACT_EVENT, onOpen);
    d.addEventListener("close", onClose);
    return () => {
      window.removeEventListener(CONTACT_EVENT, onOpen);
      d.removeEventListener("close", onClose);
    };
  }, []);

  const close = () => dialog.current?.close();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = e.currentTarget;
    const data = new FormData(f);
    const errs = validate(data);
    setErrors(errs);
    setTouched(true);
    const firstBad = (Object.keys(errs) as Field[])[0];
    if (firstBad) {
      f.querySelector<HTMLElement>(`[name="${firstBad}"]`)?.focus();
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: FORM_ACCESS_KEY,
          subject: FORM_SUBJECT,
          from_name: FORM_FROM_NAME,
          name: String(data.get("name") ?? ""),
          email: String(data.get("email") ?? ""),
          message: String(data.get("message") ?? ""),
          botcheck: (f.elements.namedItem("botcheck") as HTMLInputElement | null)?.checked ?? false,
        }),
      });
      const json = (await res.json()) as { success?: boolean };
      if (json?.success) {
        setStatus("success");
        f.reset();
        setTouched(false);
        setErrors({});
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const onChange = () => {
    if (!touched || !form.current) return;
    setErrors(validate(new FormData(form.current)));
  };

  const field = (name: Field, label: string, input: React.ReactNode) => (
    <div>
      <label htmlFor={`cf-${name}`} className="block text-[0.9375rem] font-bold text-merlot">
        {label}
      </label>
      <div className="mt-2">{input}</div>
      <p id={`cf-${name}-err`} className="mt-1.5 min-h-[1.25rem] text-[0.875rem] font-semibold text-merlot">
        {errors[name] ?? ""}
      </p>
    </div>
  );

  const inputCls =
    "w-full border-2 border-merlot bg-coconut px-4 py-3 text-[1rem] font-medium text-merlot placeholder:text-body/50 aria-[invalid=true]:border-[3px]";

  return (
    <dialog
      ref={dialog}
      aria-labelledby="cf-title"
      data-lenis-prevent
      onClick={(e) => {
        if (e.target === dialog.current) close();
      }}
      className="contact-dialog m-auto bg-transparent p-0 backdrop:bg-ink/70"
    >
      <div
        ref={card}
        className="px-corners relative max-h-[calc(100dvh-32px)] w-[min(calc(100vw-32px),580px)] overflow-y-auto bg-coconut p-7 text-merlot sm:p-10"
        style={{ "--step": "8px" } as React.CSSProperties}
      >
        <button type="button" onClick={close} aria-label="Close" className="absolute right-4 top-4 grid h-11 w-11 place-items-center text-merlot">
          <span className="burger is-open" aria-hidden="true" />
        </button>

        {status === "success" ? (
          <div className="flex flex-col items-start gap-6 py-6" role="status">
            <div className="w-[164px]">
              <PixelFox frame="wow" />
            </div>
            <p className="text-[1.6rem] font-extrabold leading-tight tracking-[-0.02em]">Thanks! Your message is on its way.</p>
            <button type="button" onClick={close} className="btn btn-merlot roll-host">
              <Roll>Close</Roll>
            </button>
          </div>
        ) : (
          <>
            <h2 id="cf-title" className="pr-12 text-[clamp(1.8rem,4vw,2.4rem)] font-extrabold leading-[1.05] tracking-[-0.03em]">
              Want to be part of the plan?
            </h2>
            <p className="mt-3 text-[1.0625rem] font-medium leading-relaxed text-body">
              Tell us about your place, brand or product, and we’ll get back to you.
            </p>
            <form ref={form} noValidate onSubmit={onSubmit} onChange={onChange} className="mt-8 flex flex-col gap-3">
              {field(
                "name",
                "Name",
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  className={inputCls}
                  aria-invalid={!!errors.name}
                  aria-describedby="cf-name-err"
                />,
              )}
              {field(
                "email",
                "Email",
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={inputCls}
                  aria-invalid={!!errors.email}
                  aria-describedby="cf-email-err"
                />,
              )}
              {field(
                "message",
                "Message",
                <textarea
                  id="cf-message"
                  name="message"
                  rows={4}
                  className={`${inputCls} resize-y`}
                  aria-invalid={!!errors.message}
                  aria-describedby="cf-message-err"
                />,
              )}
              <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
              <div className="mt-2 flex flex-wrap items-center gap-5">
                <button type="submit" disabled={status === "sending"} className="btn btn-merlot roll-host">
                  <Roll>{status === "sending" ? "Sending…" : "Send"}</Roll>
                </button>
                <p role="status" aria-live="polite" className="text-[0.9375rem] font-semibold text-merlot">
                  {status === "error" ? `Something went wrong. Please email ${PARTNERSHIPS_EMAIL}.` : ""}
                </p>
              </div>
            </form>
          </>
        )}
      </div>
    </dialog>
  );
}
