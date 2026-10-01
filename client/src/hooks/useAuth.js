import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import { login, register, logout, clearAuthError } from '../store/slices/authSlice';

/**
 * Custom hook to access authentication state and action dispatchers
 * Uses useCallback for handlers passed to children/components
 */
export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const handleLogin = useCallback(
    (credentials) => dispatch(login(credentials)),
    [dispatch]
  );

  const handleRegister = useCallback(
    (userData) => dispatch(register(userData)),
    [dispatch]
  );

  const handleLogout = useCallback(
    () => dispatch(logout()),
    [dispatch]
  );

  const handleClearError = useCallback(
    () => dispatch(clearAuthError()),
    [dispatch]
  );

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
    clearError: handleClearError,
  };
};

export default useAuth;
