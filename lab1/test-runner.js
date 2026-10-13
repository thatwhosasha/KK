const fs = require('fs');
const { execSync } = require('child_process');

const TEST_CASES_FILE = 'test-cases.txt';
const RESULTS_FILE = 'results.txt';
const TRIANGLE_CMD = 'triangle.exe';

function runTest(a, b, c, expected) {
    try {
        const output = execSync(`${TRIANGLE_CMD} ${a} ${b} ${c}`, { encoding: 'utf8' });
        const actual = output.trim().toLowerCase();
        const expectedLower = expected.toLowerCase();
        return actual === expectedLower;
    } catch (error) {
        return false;
    }
}

const testData = fs.readFileSync(TEST_CASES_FILE, 'utf8');
const lines = testData.split(/\r?\n/).filter(line => line.trim() !== '');

const results = [];

for (const line of lines) {
    const parts = line.trim().split(/\s+/);
    if (parts.length < 4) {
        results.push('error;');
        continue;
    }
    const a = parts[0];
    const b = parts[1];
    const c = parts[2];

    const expected = parts.slice(3).join(' ');
    
    const success = runTest(a, b, c, expected);
    results.push(success ? 'success;' : 'error;');
}

fs.writeFileSync(RESULTS_FILE, results.join('\n'));
console.log(`Готово! Результаты в файле ${RESULTS_FILE}`);