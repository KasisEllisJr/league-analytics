import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function DashboardLayout() {
  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <Sidebar />

      <div className="app-main">
        <main
          id="main-content"
          className="page-content"
          tabIndex={-1}
        >
          <Outlet />
        </main>

        <footer className="app-footer">
          <p>Kazer0 Analytics · League Data Archive</p>

          <p>
            Kazer0 Analytics isn't endorsed by Riot Games
            and doesn't reflect the views or opinions of
            Riot Games or anyone officially involved in
            producing or managing Riot Games properties.
            Riot Games, and all associated properties are
            trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default DashboardLayout;