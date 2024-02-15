import React, {createContext, useContext, useState} from 'react';

const ThemeContext = createContext({
  theme: 'light', // default value
  setTheme: () => {}, // noop function as default
});
export const ThemeProvider = ({children}) => {
  const [theme, setTheme] = useState('light');
  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
