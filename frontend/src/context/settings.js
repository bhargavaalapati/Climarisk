import { createContext, useContext } from 'react';

// Create the context
export const SettingsContext = createContext();

// Create the custom hook to easily use the context
export const useSettings = () => useContext(SettingsContext);