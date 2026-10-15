import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  Shield,
  ChartNoAxesCombined,
  ChartColumnIncreasing,
  Database,
} from "lucide-react";

const links = [
  {
    path: "/",
    label: "Overview",
    icon: LayoutDashboard,
    end: true,
  },
  {
    path: "/champions",
    label: "Champions",
    icon: Users,
  },
  {
    path: "/items",
    label: "Items",
    icon: Shield,
  },
  {
    path: "/analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
  },
  {
    path: "/analytics/advanced",
    label: "Advanced Analytics",
    icon: ChartColumnIncreasing,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Database size={28} />

        <div>
          <h2>KAZERO ANALYTICS</h2>
          <p>LEAGUE DATA ARCHIVE</p>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Main navigation">
        {links.map((link) => {
          const Icon = link.icon;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} aria-hidden="true" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <span className="sidebar-patch">PATCH 26.20</span>
        <p>Java · SQL Server · React</p>
      </div>
    </aside>
  );
}

export default Sidebar;