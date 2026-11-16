// Ordered from highest to lowest symmetry, the usual order in mineralogy.
// "value" is what's stored in the database; "label" is what people see.
export const CRYSTAL_SYSTEMS = [
  { value: "isometric", label: "Isometric (cubic)" },
  { value: "tetragonal", label: "Tetragonal" },
  { value: "hexagonal", label: "Hexagonal" },
  { value: "trigonal", label: "Trigonal" },
  { value: "orthorhombic", label: "Orthorhombic" },
  { value: "monoclinic", label: "Monoclinic" },
  { value: "triclinic", label: "Triclinic" },
  { value: "amorphous", label: "Amorphous (no crystal structure)" },
];

export function crystalSystemLabel(value) {
  return CRYSTAL_SYSTEMS.find((s) => s.value === value)?.label ?? value;
}

// Shows a formula typed as plain text (e.g. "Al2(SiO4)3") with subscripts.
// Only numbers right after a letter or closing bracket become subscripts,
// so a leading coefficient like the 2 in "CaSO4·2H2O" stays normal size.
export function Formula({ value }) {
  if (!value) return null;
  const parts = value.split(/(?<=[A-Za-z)\]])(\d+)/);
  return (
    <span className="formula">
      {parts.map((part, i) => (i % 2 === 1 ? <sub key={i}>{part}</sub> : part))}
    </span>
  );
}
