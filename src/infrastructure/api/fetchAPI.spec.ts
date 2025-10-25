import { fetchAPI } from './fetchAPI';

global.fetch = jest.fn();

const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('fetchAPI', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should successfully fetch transactions from the server', async () => {
    // Given: Mock the response data
    const mockTransactions = {
      transactions: [
        {
          id: 'test-123',
          amount: -50.5,
          payee: 'Test Merchant',
          timestamp: 1729872000000,
          memo: 'Test transaction',
        },
      ],
    };

    // Given: Mock the fetch response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTransactions,
    } as Response);

    // When: Call the function
    const result = await fetchAPI();

    // Then: Verify the result
    expect(result).toEqual(mockTransactions);

    // Then: Verify fetch was called with correct parameters
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch).toHaveBeenCalledWith('/api/transactions');
  });

  it('should throw an error when the API response is not ok', async () => {
    // Given: Mock a failed response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    } as Response);

    // When & Then: Verify a user-friendly error message is thrown
    await expect(fetchAPI()).rejects.toThrow(
      'Unable to fetch data. Please try again later.',
    );

    // Then: Verify fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('should catch any API error and return a user-friendly and controled error message', async () => {
    // Given: Mock an unexpected error from the API
    const unexpectedError = new Error('Unexpected server error');
    mockFetch.mockRejectedValueOnce(unexpectedError);

    // When & Then: Verify a custom error message is thrown
    await expect(fetchAPI()).rejects.toThrow(
      'Unable to fetch data. Please try again later.',
    );

    // Then: Verify fetch was called
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
