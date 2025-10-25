/**
 * Infrastructure Layer - API Communication
 * Handles HTTP communication with the backend for user-related operations
 */
const DEFAULT_URL = '/api/transactions';

type FetchAPIOptions = {
  url?: string;
  method?: 'GET' | 'POST';
  body?: Record<string, any>;
};

export const fetchAPI = async (options: FetchAPIOptions = {}) => {
  try {
    const { url = DEFAULT_URL, method = 'GET', body } = options;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, fetchOptions);

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
