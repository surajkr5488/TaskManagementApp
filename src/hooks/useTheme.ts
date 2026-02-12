// src/hooks/useTheme.ts
import { useSelector, useDispatch } from 'react-redux';


import { darkTheme, lightTheme, Theme } from '../theme';
import { setThemeMode, toggleTheme } from '../store/slices/themeSlice';
import { AppDispatch, RootState } from '../store/store';


export const useTheme = (): {
  theme: Theme;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (mode: 'light' | 'dark') => void;
} => {
  const dispatch = useDispatch<AppDispatch>();
  const themeMode = useSelector((state: RootState) => state.theme.mode);

  const theme = themeMode === 'light' ? lightTheme : darkTheme;

  const handleToggleTheme = () => {
    dispatch(toggleTheme());
  };

  const handleSetTheme = (mode: 'light' | 'dark') => {
    dispatch(setThemeMode(mode));
  };

  return {
    theme,
    themeMode,
    toggleTheme: handleToggleTheme,
    setTheme: handleSetTheme,
  };
};
