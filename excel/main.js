const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const $table = $('table');
const $head = $('thead');
const $body = $('tbody');

const ROWS = 10;
const COLUMNS = 5;
const FIRST_CHAR_CODE = 65;

const times = length => Array.from({ length }, (_,i) => i);
const getColumn = i => String.fromCharCode(FIRST_CHAR_CODE + i);

let selectedColumn = null;
let STATE = times(COLUMNS).map(i => times(ROWS).map(j => ({ computedValue: 0, value: 0 })));

function updateCell({ x, y, value }) {
    const newState = structuredClone(STATE);
    const constants = generateCellsConstants(newState);

    const cell = newState[x][y]

    cell.computedValue = computeValue(value, constants); // -> span
    cell.value = value; // -> input

    newState[x][y] = cell;
    computeAllCells(newState, generateCellsConstants(newState));
    STATE = newState;
    renderSpreadSheet();
}

function generateCellsConstants(cells) {
    return cells.map((rows, x) => {
        return rows.map((cell, y) => {
            const letter = getColumn(x) // -> A
            const cellId = `${letter}${y + 1}` // -> A1
            return `const ${cellId} = ${cell.computedValue};`
        }).join('\n')
    }).join('\n')
}

function computeAllCells(cells, constants) {
    console.log('computeAllCells')
    cells.forEach((rows, x) => {
        rows.forEach((cell, y) => {
            const computedValue = computeValue(cell.value, constants)
            cell.computedValue = computedValue
        })
    })
  }

function computeValue(value, constants) {
    if (typeof value === 'number') return value;
    if (!value.startsWith('=')) return value;

    const formula = value.slice(1);

    let computedValue;
    try {
        computedValue = eval(`(() => {
        ${constants}
        return ${formula};
    })()`);
    } catch (e) {
        computedValue = `!ERROR: ${e.message}`;
    }

    console.log({ value, computedValue });

    return computedValue;
}

const renderSpreadSheet = () => {
    const headerHTML = `<tr>
        <th></th>
        ${times(COLUMNS).map(i => `<th>${getColumn(i)}</th>`).join('')}
    </tr>`;

    $head.innerHTML = headerHTML;

    const bodyHTML = times(ROWS).map(row => {
        return `<tr>
            <td>${row + 1}</td>
            ${times(COLUMNS).map(column => `
            <td data-x="${column}" data-y="${row}">
            <span>${STATE[column][row].computedValue}</span>
            <input type="text" value="${STATE[column][row].value}" />
            </td>
            `).join('')}
        </tr>`
    }).join('')

    $body.innerHTML = bodyHTML
}

$body.addEventListener('click', event => {
    const td = event.target.closest('td');
    if (!td) return;

    const { x, y } = td.dataset
    const input = td.querySelector('input');
    const span = td.querySelector('span');

    const end = input.value.length;
    input.setSelectionRange(end, end);
    input.focus();

    $$('.selected').forEach(el => el.classList.remove('selected'));
    selectedColumn = null;

    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') input.blur();
    })

    input.addEventListener('blur', () => {
        console.log({ value: input.value, state: STATE[x][y].value });

        if (input.value === STATE[x][y].value) return;

        updateCell({ x, y, value: input.value });
    }, { once: true });
})

$head.addEventListener('click', event => {
    const th = event.target.closest('th');
    if (!th) return;

    const x = [...th.parentNode.children].indexOf(th);
    if (x <= 0) return;

    selectedColumn = x - 1;

    $$('.selected').forEach(el => el.classList.remove('selected'));
    th.classList.add('selected');
    $$(`tr td:nth-child(${x + 1})`).forEach(el => el.classList.add('selected'));
})

document.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && selectedColumn !== null) {
        times(ROWS).forEach(row => {
            updateCell({ x: selectedColumn, y: row, value: '' })
        });
        renderSpreadSheet();
    }
})

document.addEventListener('copy', event => {
    if (selectedColumn !== null) {
        const columnValues = times(ROWS).map(row => {
            return STATE[selectedColumn][row].computedValue
        });

        event.clipboardData.setData('text/plain', columnValues.join('\n'));
        event.preventDefault();
    }
  })

document.addEventListener('click', event => {
    const { target } = event;

    const isThClicked = target.closest('th');
    const isTdClicked = target.closest('td');

    if (!isThClicked && !isTdClicked) {
        $$('.selected').forEach(el => el.classList.remove('selected'));
        selectedColumn = null;
    }
})

renderSpreadSheet();