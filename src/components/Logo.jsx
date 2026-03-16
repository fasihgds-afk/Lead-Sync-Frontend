import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Reusable Logo component that automatically switches between 
 * light and dark versions based on the current theme state.
 */
const Logo = ({ className = "", ...props }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch by waiting for mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder or the default theme version to avoid layout shift
    return <div className={`inline-flex items-center ${className}`} {...props} />;
  }

  const isDarkMode = theme === 'dark';

  return (
    <div className={`logo-container inline-flex items-center ${className}`}>
      <img
        src={isDarkMode ? "/Logo - Lead Sync.(Dark Mode).svg" : "/Logo - Lead Sync.(Lght Mode).svg"}
        alt="LeadSync Logo"
        className="h-full w-auto transition-opacity duration-300"
        {...props}
      />
    </div>
  );
};

export default Logo;
