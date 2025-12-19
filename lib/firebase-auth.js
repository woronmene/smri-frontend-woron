import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from './firebase';

/**
 * Register a new user with email and password
 */
export const registerUser = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    // Send email verification
    await sendEmailVerification(userCredential.user);
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Registration successful! Please check your email to verify your account.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Sign in user with email and password
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    return {
      success: true,
      user: userCredential.user,
      token: await userCredential.user.getIdToken(),
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Sign out current user
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Send password reset email
 */
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent! Please check your inbox.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Confirm password reset with code
 */
export const resetPassword = async (oobCode, newPassword) => {
  try {
    await confirmPasswordReset(auth, oobCode, newPassword);
    return {
      success: true,
      message: 'Password reset successful! You can now sign in with your new password.',
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getAuthErrorMessage(error.code),
    };
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Get user ID token
 */
export const getUserToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

/**
 * Helper function to convert Firebase auth error codes to user-friendly messages
 */
const getAuthErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/email-already-in-use': 'This email is already registered. Please sign in instead.',
    'auth/invalid-email': 'Invalid email address format.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'Invalid or expired link. Please request a new one.',
  };

  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again.';
};
