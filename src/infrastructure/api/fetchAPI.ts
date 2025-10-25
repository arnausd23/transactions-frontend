/**
 * Infrastructure Layer - API Communication
 * Handles HTTP communication with the backend for user-related operations
 */
const DEFAULT_URL = '/api/transactions';

export const fetchAPI = async (url: string = DEFAULT_URL) => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  } catch (error) {
    // We can do any centralized logging here if needed, like pushing errors to Datadog, Sentry, etc.
    console.error('API Error:', error);
    // Transform any error into a user-friendly message, also we can handle specific error messages here
    throw new Error('Unable to fetch data. Please try again later.');
  }
};
