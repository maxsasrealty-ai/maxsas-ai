/**
 * TEST REPORTING UTILITY
 * Console-based test report generation for UI regression testing
 * 
 * Usage:
 *   TestReporter.startTest('TC-1.1', 'Create Batch via Manual Entry');
 *   TestReporter.log('Navigating to upload screen...');
 *   TestReporter.pass('Batch created successfully');
 *   TestReporter.generateReport();
 */

interface TestCase {
  id: string;
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP' | 'IN_PROGRESS';
  logs: string[];
  duration: number;
  startTime: number;
  errors: string[];
}

interface TestReport {
  title: string;
  timestamp: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  successRate: string;
  testCases: TestCase[];
  criticalIssues: string[];
  minorIssues: string[];
  environment: Record<string, string>;
}

export class TestReporter {
  private static currentTest: TestCase | null = null;
  private static testCases: TestCase[] = [];
  private static criticalIssues: string[] = [];
  private static minorIssues: string[] = [];
  private static startTime: number = 0;
  private static environment: Record<string, string> = {};

  static setEnvironment(env: Record<string, string>) {
    this.environment = env;
    this.logSection('ENVIRONMENT', `Device: ${env.device}, Network: ${env.network}, Auth: ${env.auth}`);
  }

  static startTest(testId: string, testName: string) {
    if (this.currentTest) {
      this.finishCurrentTest();
    }

    this.currentTest = {
      id: testId,
      name: testName,
      status: 'IN_PROGRESS',
      logs: [],
      duration: 0,
      startTime: Date.now(),
      errors: [],
    };

    this.logSection('TEST START', `${testId}: ${testName}`);
  }

  static log(message: string) {
    if (!this.currentTest) return;
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    this.currentTest.logs.push(logEntry);
    console.log(`  ℹ️  ${logEntry}`);
  }

  static pass(message: string) {
    if (!this.currentTest) return;
    const entry = `✅ PASS: ${message}`;
    this.currentTest.logs.push(entry);
    console.log(`    ${entry}`);
  }

  static fail(message: string, error?: Error) {
    if (!this.currentTest) return;
    const entry = `❌ FAIL: ${message}`;
    this.currentTest.logs.push(entry);
    this.currentTest.errors.push(message);
    this.currentTest.status = 'FAIL';
    console.error(`    ${entry}`);
    if (error) {
      console.error(`    Error: ${error.message}`);
      this.currentTest.errors.push(error.message);
    }
  }

  static critical(issue: string) {
    this.criticalIssues.push(issue);
    console.error(`🔴 CRITICAL: ${issue}`);
  }

  static warning(issue: string) {
    this.minorIssues.push(issue);
    console.warn(`⚠️  WARNING: ${issue}`);
  }

  static assert(condition: boolean, message: string) {
    if (condition) {
      this.pass(message);
    } else {
      this.fail(message);
    }
  }

  static async assertAsync(condition: Promise<boolean>, message: string) {
    try {
      const result = await condition;
      if (result) {
        this.pass(message);
      } else {
        this.fail(message);
      }
    } catch (error) {
      this.fail(message, error as Error);
    }
  }

  static skip(reason: string) {
    if (!this.currentTest) return;
    this.currentTest.status = 'SKIP';
    const entry = `⏭️  SKIPPED: ${reason}`;
    this.currentTest.logs.push(entry);
    console.log(`    ${entry}`);
  }

  private static finishCurrentTest() {
    if (!this.currentTest) return;

    this.currentTest.duration = Date.now() - this.currentTest.startTime;

    if (this.currentTest.status === 'IN_PROGRESS') {
      this.currentTest.status = 'PASS';
    }

    this.testCases.push(this.currentTest);

    const duration = `${this.currentTest.duration}ms`;
    const statusIcon =
      this.currentTest.status === 'PASS'
        ? '✅'
        : this.currentTest.status === 'FAIL'
          ? '❌'
          : '⏭️ ';

    console.log(`  ${statusIcon} [${duration}] ${this.currentTest.id}`);
    console.log('');

    this.currentTest = null;
  }

  static generateReport(): TestReport {
    if (this.currentTest) {
      this.finishCurrentTest();
    }

    const passed = this.testCases.filter((t) => t.status === 'PASS').length;
    const failed = this.testCases.filter((t) => t.status === 'FAIL').length;
    const skipped = this.testCases.filter((t) => t.status === 'SKIP').length;
    const total = this.testCases.length;
    const totalDuration = this.testCases.reduce((sum, t) => sum + t.duration, 0);
    const successRate = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';

    const report: TestReport = {
      title: 'UI REGRESSION TEST REPORT',
      timestamp: new Date().toISOString(),
      totalTests: total,
      passed,
      failed,
      skipped,
      duration: totalDuration,
      successRate: `${successRate}%`,
      testCases: this.testCases,
      criticalIssues: this.criticalIssues,
      minorIssues: this.minorIssues,
      environment: this.environment,
    };

    this.printReport(report);
    return report;
  }

  private static printReport(report: TestReport) {
    console.clear();

    // Header
    console.log('═'.repeat(80));
    console.log(`${'═ ' + report.title}`.padEnd(80, '═'));
    console.log('═'.repeat(80));
    console.log('');

    // Summary
    console.log('📊 TEST SUMMARY');
    console.log('─'.repeat(80));
    console.log(`  Timestamp: ${report.timestamp}`);
    console.log(`  Total Tests: ${report.totalTests}`);
    console.log(`  ✅ Passed: ${report.passed}`);
    console.log(`  ❌ Failed: ${report.failed}`);
    console.log(`  ⏭️  Skipped: ${report.skipped}`);
    console.log(`  Success Rate: ${report.successRate}`);
    console.log(`  Total Duration: ${(report.duration / 1000).toFixed(2)}s`);
    console.log('');

    // Environment
    console.log('🌍 ENVIRONMENT');
    console.log('─'.repeat(80));
    Object.entries(report.environment).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    console.log('');

    // Test Cases
    if (report.testCases.length > 0) {
      console.log('🧪 TEST CASES');
      console.log('─'.repeat(80));
      report.testCases.forEach((testCase) => {
        const icon =
          testCase.status === 'PASS'
            ? '✅'
            : testCase.status === 'FAIL'
              ? '❌'
              : '⏭️ ';
        console.log(`  ${icon} ${testCase.id}: ${testCase.name}`);
        console.log(`     Duration: ${testCase.duration}ms`);

        if (testCase.errors.length > 0) {
          console.log(`     Errors:`);
          testCase.errors.forEach((error) => {
            console.log(`       - ${error}`);
          });
        }

        // Show last 3 logs for context
        if (testCase.logs.length > 0) {
          const recentLogs = testCase.logs.slice(-3);
          recentLogs.forEach((log) => {
            console.log(`       ${log}`);
          });
        }
      });
      console.log('');
    }

    // Critical Issues
    if (report.criticalIssues.length > 0) {
      console.log('🔴 CRITICAL ISSUES');
      console.log('─'.repeat(80));
      report.criticalIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Minor Issues
    if (report.minorIssues.length > 0) {
      console.log('⚠️  MINOR ISSUES');
      console.log('─'.repeat(80));
      report.minorIssues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
      console.log('');
    }

    // Recommendations
    console.log('💡 RECOMMENDATIONS');
    console.log('─'.repeat(80));
    if (report.failed === 0 && report.criticalIssues.length === 0) {
      console.log('  ✅ All tests passed! Ready for release.');
    } else {
      console.log('  ⚠️  Fix critical issues before release:');
      const allIssues = [...report.criticalIssues];
      report.testCases
        .filter((t) => t.status === 'FAIL')
        .forEach((t) => {
          t.errors.forEach((e) => {
            allIssues.push(`[${t.id}] ${e}`);
          });
        });
      allIssues.forEach((issue) => {
        console.log(`    - ${issue}`);
      });
    }
    console.log('');

    // Footer
    console.log('═'.repeat(80));
    console.log(`Generated: ${new Date().toLocaleString()}`);
    console.log('═'.repeat(80));
  }

  static logSection(section: string, message: string) {
    console.log('');
    console.log(`━━━ ${section} ━━━`);
    console.log(`${message}`);
  }

  static table(data: Record<string, any>[]) {
    console.table(data);
  }

  static reset() {
    this.currentTest = null;
    this.testCases = [];
    this.criticalIssues = [];
    this.minorIssues = [];
    this.startTime = Date.now();
    this.environment = {};
  }
}

export default TestReporter;
