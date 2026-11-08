import Link from "next/link";

export default function Home() {
  return (
    <div>
      <h1>Binghamton Mineral Explorer</h1>
      <p className="muted">Browse the rocks on campus and the minerals in the department.</p>
      <div className="grid">
        <Link href="/rocks" className="card home-card">
          <h2>Campus Rocks</h2>
          <p>Find rocks around campus on the map.</p>
        </Link>
        <Link href="/minerals" className="card home-card">
          <h2>Department Minerals</h2>
          <p>The department&apos;s mineral collection, by room.</p>
        </Link>
      </div>
    </div>
  );
}
