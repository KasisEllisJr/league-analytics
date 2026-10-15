import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";

import Overview from "./pages/Overview";
import Champions from "./pages/Champions";
import ChampionDetails from "./pages/ChampionDetails";
import Items from "./pages/Items";
import ItemDetails from "./pages/ItemDetails";
import ItemComparison from "./pages/ItemComparison";
import Analytics from "./pages/Analytics";
import AdvancedAnalytics from "./pages/AdvancedAnalytics";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
        <Routes>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Overview />} />

            <Route
              path="/champions"
              element={<Champions />}
            />

            <Route
              path="/champions/:id"
              element={<ChampionDetails />}
            />

            <Route
              path="/items"
              element={<Items />}
            />

            <Route
              path="/items/compare"
              element={<ItemComparison />}
            />

            <Route
              path="/items/:id"
              element={<ItemDetails />}
            />

            <Route
              path="/analytics"
              element={<Analytics />}
            />

            <Route
              path="/analytics/advanced"
              element={<AdvancedAnalytics />}
            />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
    </BrowserRouter>
  );
}

export default App;