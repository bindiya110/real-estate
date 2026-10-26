import toast from 'react-hot-toast';
import { getErrorMessage, getFieldErrors } from '../services/api';

/**
 * Maps server validation errors onto react-hook-form fields and shows a toast for the rest.
 * Returns the general message so forms can also render it inline.
 */
export function applyServerErrors(error, setError, { toastMessage = true } = {}) {
  const fieldErrors = getFieldErrors(error);
  Object.entries(fieldErrors).forEach(([field, message]) => {
    setError?.(field, { type: 'server', message });
  });
  const message = getErrorMessage(error);
  if (toastMessage) toast.error(message);
  return message;
}
