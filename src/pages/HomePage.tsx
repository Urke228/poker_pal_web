import { Link } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import "./HomePage.css";

interface Tile {
  to?: string;
  icon: string;
  label: string;
  sublabel: string;
}

const TILES: Tile[] = [
  {
    to: "/clocks",
    icon: "⏱",
    label: "Tournament Clock",
    sublabel: "Run or view a live blinds clock",
  },
  {
    icon: "🪑",
    label: "Seating",
    sublabel: "Coming soon",
  },
  {
    icon: "👥",
    label: "Players",
    sublabel: "Coming soon",
  },
  {
    to: "/stats",
    icon: "📊",
    label: "Stats",
    sublabel: "Track your results over time",
  },
];

export function HomePage() {
  return (
    <div>
      <TopBar />
      <main className="home-main">
        <h1>Features</h1>
        <div className="tile-grid">
          {TILES.map((tile) =>
            tile.to ? (
              <Link key={tile.label} to={tile.to} className="tile">
                <span className="tile-icon">{tile.icon}</span>
                <span className="tile-label">{tile.label}</span>
                <span className="tile-sub">{tile.sublabel}</span>
              </Link>
            ) : (
              <div key={tile.label} className="tile tile-disabled">
                <span className="tile-icon">{tile.icon}</span>
                <span className="tile-label">{tile.label}</span>
                <span className="tile-sub">{tile.sublabel}</span>
              </div>
            ),
          )}
        </div>
      </main>
    </div>
  );
}
