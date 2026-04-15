import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface GlobalRefreshContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const GlobalRefreshContext = createContext<GlobalRefreshContextType>({
  refreshTrigger: 0,
  triggerRefresh: () => {},
});

export const useGlobalRefresh = () => {
  const context = useContext(GlobalRefreshContext);
  if (!context) {
    throw new Error("useGlobalRefresh must be used within a GlobalRefreshProvider");
  }
  return context;
};

export const GlobalRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = useCallback(() => {
    console.log("🔄 Triggering global refresh...");
    setRefreshTrigger(prev => prev + 1);
  }, []);

  return (
    <GlobalRefreshContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </GlobalRefreshContext.Provider>
  );
};