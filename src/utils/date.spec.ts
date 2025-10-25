import { formatDate } from './date';

describe('date', () => {
  describe('formatDate', () => {
    it('should format timestamp to Y-m-d H:i format', () => {
      // Given: a timestamp representing 2025-10-25 14:30:00 UTC
      const timestamp = 1729866600000;

      // When: formatting the timestamp
      const result = formatDate(timestamp);

      // Then: it should return the date in YYYY-MM-DD HH:mm format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);

      // And: it should contain the correct date parts
      expect(result).toContain('2025');
      expect(result).toContain('10');
      expect(result).toContain('25');
    });
  });
});
