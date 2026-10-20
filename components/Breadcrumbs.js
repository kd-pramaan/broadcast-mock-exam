import Link from "next/link";

export default function Breadcrumbs({ items, root = { label: "Dashboard", href: "/dashboard" } }) {
  if (!items || items.length === 0) return null;

  return (
    <div className="breadcrumb" aria-label="Breadcrumb">
      <Link href={root.href}>{root.label}</Link>
      {items.map((item, index) => (
        <span className="crumb" key={`${item.label}-${index}`}>
          <span className="sep">/</span>
          {item.href ? <Link href={item.href}>{item.label}</Link> : <span className="current">{item.label}</span>}
        </span>
      ))}
    </div>
  );
}
