import { LAUNCH_ISO, SITE_URL } from "@/config";

/** Calendar timestamp in UTC: 20261129T220000Z. */
function utcStamp(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** The launch event as an RFC 5545 calendar file (CRLF line endings). */
export function launchIcs(now = new Date()): string {
  const start = new Date(LAUNCH_ISO);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Questita//Landing page//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    "UID:board-opens-2026@questita.com",
    `DTSTAMP:${utcStamp(now)}`,
    `DTSTART:${utcStamp(start)}`,
    `DTEND:${utcStamp(end)}`,
    "SUMMARY:Questita board opens",
    "DESCRIPTION:The Questita board opens in Cairo. Find the thing. Find your people.",
    "LOCATION:Cairo",
    `URL:${SITE_URL}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
}

/** Build the .ics client side and hand it to the browser as a download. */
export function downloadLaunchIcs() {
  const blob = new Blob([launchIcs()], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questita-board-opens.ics";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
