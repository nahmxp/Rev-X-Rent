import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Default to light theme
  const [theme, setTheme] = useState('light');
  const [isClient, setIsClient] = useState(false);
  
  // Check for client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  useEffect(() => {
    if (!isClient) return;
    
    // On initial load, check for stored theme preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    // Apply theme to document body
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme, isClient]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
} 