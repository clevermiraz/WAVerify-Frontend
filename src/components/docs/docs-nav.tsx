const SECTIONS = [
  { id: "quickstart", label: "Quickstart" },
  { id: "authentication", label: "Authentication" },
  { id: "check", label: "Check a number" },
  { id: "responses", label: "Responses" },
  { id: "errors", label: "Errors" },
  { id: "rate-limits", label: "Rate limits" },
  { id: "openapi", label: "OpenAPI schema" },
];

/** Sticky in-page table of contents. Hidden below `lg` to keep mobile clean. */
export function DocsNav() {
  return (
    <aside className="hidden w-48 shrink-0 lg:block">
      <nav aria-label="On this page" className="sticky top-24">
        <p className="text-muted-foreground mb-3 text-xs font-medium tracking-wide uppercase">
          On this page
        </p>
        <ul className="space-y-1">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-muted-foreground hover:text-foreground block rounded-md py-1 text-sm transition-colors"
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
