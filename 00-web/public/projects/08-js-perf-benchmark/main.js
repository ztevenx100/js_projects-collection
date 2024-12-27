// UTILITIES
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

const $globalCode = document.querySelector('#global')
const $sendButton = document.querySelector('.send-button')
const $bars = document.querySelectorAll('.bar')
const $percentages = document.querySelectorAll('.percentage')

const COLORS = ['green', 'yellow', 'orange', 'red', 'purple']

async function runTest({ code, data }) {
    const worker = new Worker('worker.js')
    worker.postMessage({ code, data, duration: 1000 })

    // return new Promise(resolve => {
    //   worker.onmessage = event => {
    //     resolve(event.data)
    //   }
    // })

    const { resolve, promise } = Promise.withResolvers()
    worker.onmessage = event => { resolve(event.data) }
    return promise
}

async function runTestCases() {
    const $testCases = document.querySelectorAll('.test-case')

    $bars.forEach(bar => bar.setAttribute('height', 0))
    $percentages.forEach(percentage => percentage.textContent = '')

    const globalCode = $globalCode.value

    const promises = Array.from($testCases).map(async (testCase, index) => {
    const $code = testCase.querySelector('.code')
    const $ops = testCase.querySelector('.ops')

    const codeValue = $code.value
    $ops.textContent = 'Loading...'

    const result = await runTest({ code: codeValue, data: globalCode })

    $ops.textContent = `${result.toLocaleString()} ops/s`

    return result
    })

    const results = await Promise.all(promises)

    const maxOps = Math.max(...results)

    const sortedResults = results
    .map((result, index) => ({ result, index }))
    .sort((a, b) => b.result - a.result)

    console.log({ sortedResults })

    results.forEach((result, index) => {
    const bar = $bars[index]
    const percentage = $percentages[index]

    const indexColor = sortedResults.findIndex(x => x.index === index)
    const color = COLORS[indexColor]

    const height = result / maxOps * 300 // 300 is the height of the chart
    bar.setAttribute('height', height)
    bar.setAttribute('fill', color)

    const percentageValue = Math.round(result / maxOps * 100)
    percentage.textContent = `${percentageValue}%`
    })
}

// run test cases on init
runTestCases()

$sendButton.addEventListener('click', () => {
    runTestCases()
})
