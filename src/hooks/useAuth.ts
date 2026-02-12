
import {useSelector, useDispatch} from 'react-redux';

import {AppDispatch, RootState} from '../store/store';
import {clearError, login, logout, signUp} from '../store/slices/authSlice';
import {LoginCredentials, SignUpCredentials} from '../types/auth.types';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const handleLogin = async (credentials: LoginCredentials) => {
    return dispatch(login(credentials)).unwrap();
  };

  const handleSignUp = async (credentials: SignUpCredentials) => {
    return dispatch(signUp(credentials)).unwrap();
  };

  const handleLogout = async () => {
    return dispatch(logout()).unwrap();
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  return {
    user: auth.user,
    loading: auth.loading,
    error: auth.error,
    isAuthenticated: auth.isAuthenticated,
    login: handleLogin,
    signUp: handleSignUp,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

