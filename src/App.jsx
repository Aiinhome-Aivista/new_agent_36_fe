import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar/Sidebar';
import LandingPage from './pages/LandingPage';
import DeveloperAssistant from './pages/DeveloperAssistant';
import KnowledgeBase from './pages/KnowledgeBase';
import Dashboard from './pages/Dashboard';

function generateUUID() {
  return 'session_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36);
}

// Internal App Layout: Parent Sidebar automatically collapses to icon-only when child sidebar is open
function AppLayout({ theme, toggleTheme, isChildSidebarOpen }) {
  const location = useLocation();
  const isChatRoute = location.pathname === '/chat';
  // When child sidebar is open in chat, parent sidebar collapses into icon-only mode
  const isParentCollapsed = isChatRoute && isChildSidebarOpen;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-base text-text-primary transition-colors duration-250">
      {/* Parent Sidebar - icon-only when child sidebar is open */}
      <Sidebar 
        theme={theme}
        toggleTheme={toggleTheme}
        isCollapsed={isParentCollapsed}
      />

      {/* Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-bg-base">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  // Theme state: defaults to saved preference or 'light'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('devknow_theme') || 'light';
  });

  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem('devknow_session_id') || generateUUID();
  });

  // Track child sidebar state (open by default)
  const [isChildSidebarOpen, setIsChildSidebarOpen] = useState(true);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleConversationUpdated = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Apply dark mode class to html element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('devknow_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('devknow_session_id', sessionId);
  }, [sessionId]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleNewChat = () => {
    const newId = generateUUID();
    setSessionId(newId);
  };

  return (
    <Router>
      <Routes>
        {/* Minimalist Standalone Landing Page (Full-screen, NO sidebar) */}
        <Route 
          path="/" 
          element={<LandingPage theme={theme} toggleTheme={toggleTheme} />} 
        />

        {/* Application Workspace Routes (with Parent Sidebar) */}
        <Route 
          element={
            <AppLayout 
              theme={theme} 
              toggleTheme={toggleTheme} 
              isChildSidebarOpen={isChildSidebarOpen}
            />
          }
        >
          <Route
            path="/chat"
            element={
              <DeveloperAssistant
                sessionId={sessionId}
                onSessionChange={setSessionId}
                onNewChat={handleNewChat}
                onConversationUpdated={handleConversationUpdated}
                refreshTrigger={refreshTrigger}
                isHistoryOpen={isChildSidebarOpen}
                setIsHistoryOpen={setIsChildSidebarOpen}
              />
            }
          />
          <Route path="/knowledge-base" element={<KnowledgeBase />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
}
