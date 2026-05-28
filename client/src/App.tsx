import { Routes, Route, Navigate } from 'react-router-dom';
import { useTheme } from './hooks/useTheme';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Setup from './pages/Setup';
import Confirm from './pages/Confirm';

export default function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Routes>
      <Route path="/" element={<Landing theme={theme} onToggleTheme={toggleTheme} />} />
      <Route element={<AppLayout theme={theme} onToggleTheme={toggleTheme} />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/proposals" element={<Proposals />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/setup" element={<Setup />} />
      </Route>
      {/* Legacy paths → app */}
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
