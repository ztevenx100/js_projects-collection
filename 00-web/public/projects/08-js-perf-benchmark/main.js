// UTILITIES
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const $globalCodeInput = document.querySelector('#global')
const $sendButton = document.querySelector('.send-button')
const $bars = document.querySelectorAll('.bar')
const $percentages = document.querySelectorAll('.percentage')

const COLORS = ['green', 'yellow', 'orange', 'red', 'purple']

function withResolvers() {
    let resolve, reject;
    const promise = new Promise((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { resolve, reject, promise };
}

async function runTest({ code, data }) {
    try {
        const worker = new Worker('worker.js');
        worker.postMessage({ code, data, duration: 1000 });

        const { resolve, reject, promise } = withResolvers();
        worker.onmessage = event => resolve(event.data);
        return promise;
    } catch (error) {
        console.error('Error running test:', error);
        return 0;
    }
}

function resetBarsAndPercentages() {
    $bars.forEach(bar => bar.setAttribute('height', 0));
    $percentages.forEach(percentage => (percentage.textContent = ''));
}

async function runTestCases() {
    resetBarsAndPercentages();

    const testCases = Array.from($$('.test-case'));
    const globalCode = $globalCodeInput.value;

    const results = await executeTestCases(testCases, globalCode);

    const maxOps = Math.max(...results);
    const sortedResults = results
        .map((result, index) => ({ result, index }))
        .sort((a, b) => b.result - a.result);

    results.forEach((result, index) => {
        updateBarAndPercentage(index, result, maxOps, sortedResults);
    });
}

function updateBarAndPercentage(index, result, maxOps, sortedResults) {
    const bar = $bars[index];
    const percentage = $percentages[index];

    const indexColor = sortedResults.findIndex(x => x.index === index);
    const color = COLORS[indexColor];

    const height = (result / maxOps) * 300;
    bar.setAttribute('height', height);
    bar.setAttribute('fill', color);

    const percentageValue = Math.round((result / maxOps) * 100);
    percentage.textContent = `${percentageValue}%`;
}

async function executeTestCases(testCases, globalCode) {
    return Promise.all(
        testCases.map(async testCase => {
            const codeValue = testCase.querySelector('.code').value;
            const ops = testCase.querySelector('.ops');
            ops.textContent = 'Loading...';

            const result = await runTest({ code: codeValue, data: globalCode });
            ops.textContent = `${result.toLocaleString()} ops/s`;
            return result;
        })
    );
}

// run test cases on init
runTestCases();
$sendButton.addEventListener('click', runTestCases)
