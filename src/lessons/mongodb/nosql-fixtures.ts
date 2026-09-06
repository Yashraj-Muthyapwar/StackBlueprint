// Synthetic, deterministic lesson fixtures. No database connection is used.
export const catalog = [
  {
    _id: "bike-101",
    name: "City bicycle",
    price: 420,
    specs: { frame_size_cm: 54 },
    tags: ["commute", "city"],
  },
  {
    _id: "light-202",
    name: "Front light",
    price: 35,
    specs: { lumens: 600 },
    tags: ["commute", "night"],
  },
];
export const practiceStarter = JSON.stringify(
  { _id: "helmet-303", name: "Commuter helmet", price: "65", specs: {}, tags: ["commute"] },
  null,
  2,
);
export const practiceSolution = {
  _id: "helmet-303",
  name: "Commuter helmet",
  price: 65,
  specs: { size: "M" },
  tags: ["commute"],
};

export function checkHelmetDocument(source: string): {
  ok: boolean;
  message: string;
  document?: Record<string, unknown>;
} {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return {
      ok: false,
      message:
        "This is not valid JSON yet. Use double quotes around field names and strings, and check commas and braces.",
    };
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    return {
      ok: false,
      message:
        "Start with one document enclosed in braces, rather than an array or a single value.",
    };
  const doc = value as Record<string, unknown>;
  if (doc._id !== "helmet-303" || doc.name !== "Commuter helmet")
    return {
      ok: false,
      message:
        'Keep _id as "helmet-303" and name as "Commuter helmet" so this remains the requested product.',
    };
  if (doc.price !== 65)
    return { ok: false, message: 'Set price to the number 65, without quotes. "65" is a string.' };
  if (!doc.specs || typeof doc.specs !== "object" || Array.isArray(doc.specs))
    return {
      ok: false,
      message: "Make specs an embedded document, with braces around its fields.",
    };
  const specs = doc.specs as Record<string, unknown>;
  if (specs.size !== "M")
    return {
      ok: false,
      message: 'Add "size": "M" inside specs. The helmet has its own specification.',
    };
  if ("lumens" in specs || "frame_size_cm" in specs)
    return {
      ok: false,
      message:
        "Remove lumens and frame_size_cm from the helmet's specs. Documents do not need irrelevant fields from other products.",
    };
  if (
    !Array.isArray(doc.tags) ||
    !doc.tags.includes("commute") ||
    !doc.tags.every((tag) => typeof tag === "string")
  )
    return { ok: false, message: 'Keep tags as an array of strings containing "commute".' };
  return {
    ok: true,
    message:
      "Correct. The helmet keeps the common fields and numeric price, adds its own nested size, and needs neither bike nor light specifications.",
    document: doc,
  };
}
