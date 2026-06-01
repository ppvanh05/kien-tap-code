/**
 * Sinh test data duy nhất và traceable cho automation.
 */
export class DataGenerator {
  static generateTraceableEmail(testName: string): string {
    const safeName = this.normalizeName(testName);
    return `auto_${safeName}_${Date.now()}@test.com`;
  }

  static generateTraceableKeyword(testName: string): string {
    const email = this.generateTraceableEmail(testName);
    return email.replace('@test.com', '_test_com');
  }

  static generateLongKeyword(length = 256): string {
    return 'a'.repeat(length);
  }

  private static normalizeName(testName: string): string {
    return testName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }
}
