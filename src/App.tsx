import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { LoginPage } from "./auth/LoginPage";
import { SignUpPage } from "./auth/SignUpPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LegacyClockRedirect } from "./components/LegacyClockRedirect";
import { HomePage } from "./pages/HomePage";
import { ClocksListPage } from "./pages/ClocksListPage";
import { ClockPage } from "./clock/ClockPage";
import { StatsPage } from "./pages/StatsPage";
import { TournamentsListPage } from "./pages/TournamentsListPage";
import { TournamentDetailPage } from "./pages/TournamentDetailPage";
import { TournamentFormPage } from "./pages/TournamentFormPage";
import { TournamentDisplayPage } from "./pages/TournamentDisplayPage";
import { ProfilePage } from "./pages/ProfilePage";
import "./theme.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          {/*
            The root doubles as the landing point for legacy `/?t=<id>` clock
            links. The redirect is outside ProtectedRoute so an unauthenticated
            display keeps the tournament id instead of losing it to /login.
          */}
          <Route
            path="/"
            element={
              <LegacyClockRedirect>
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              </LegacyClockRedirect>
            }
          />
          {/* "/new" is declared before "/:id" so it is not read as an id. */}
          <Route
            path="/tournaments"
            element={
              <ProtectedRoute>
                <TournamentsListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/new"
            element={
              <ProtectedRoute>
                <TournamentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id"
            element={
              <ProtectedRoute>
                <TournamentDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id/edit"
            element={
              <ProtectedRoute>
                <TournamentFormPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tournaments/:id/display"
            element={
              <ProtectedRoute>
                <TournamentDisplayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clocks"
            element={
              <ProtectedRoute>
                <ClocksListPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clock"
            element={
              <ProtectedRoute>
                <ClockPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/stats"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
