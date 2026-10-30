import type { PlanItem } from "./types";

export function planToText(items: PlanItem[]): string {
  const lines = [
    "Pitlane session plan",
    "This list is notes. It did not change the computer. Do each step yourself, and skip any you do not want.",
    "",
  ];
  items.forEach((item, index) => {
    lines.push(`${index + 1}. ${item.title} [${item.safety}] — ${item.status === "done" ? "marked done" : "not done"}`);
    lines.push(`   ${item.summary}`);
    item.steps.forEach((step, i) => lines.push(`   ${i + 1}) ${step}`));
    if (item.undo.length) {
      lines.push("   Undo:");
      item.undo.forEach((step) => lines.push(`   - ${step}`));
    }
    lines.push("");
  });
  return lines.join("\n").trim();
}

export function fitsPlatform(platforms: string[], os: string): boolean {
  if (platforms.includes("any")) return true;
  if (os === "unknown") return platforms.includes("windows");
  if (os === "deck") return platforms.includes("deck") || platforms.includes("linux");
  return platforms.includes(os);
}
