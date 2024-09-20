const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const $table = $('table');
const $head = $('thead');
const $body = $('tbody');

const ROWS = 20;
const COLUMNS = 15;
const FIRST_CHAR_CODE = 65;

const times = length => Array.from({ length }, (_,i) => i);
let selectedColumn = null;
let selectedRow = null;
let STATE = times(COLUMNS).map(i => times(ROWS).map(j => ({ computedValue: 0, value: 0 })));

/**
 * Verifica si un valor dado es un número válido.
 *
 * @param {*} valor - El valor que se va a verificar.
 * @returns {boolean} - `true` si el valor es un número válido, `false` en caso contrario.
 */
function esNumero(valor) {
    return !isNaN(parseFloat(valor)) && isFinite(valor);
}


/**
 * Convierte un índice numérico en una representación de letra de columna (similar a las columnas de Excel).
 * Esta función toma un índice numérico `i` y lo convierte en una letra o combinación de letras que representan
 * una columna en una hoja de cálculo, utilizando el sistema de columnas de Excel (por ejemplo, 0 -> A, 1 -> B, 26 -> AA).
 *
 * @param {number} i - El índice de la columna (empezando desde 0).
 * @returns {string} - La letra o combinación de letras que representa la columna.
 */
const getColumn = (i) => {
    if(!i) return 'A';

    let num = Number(i)+1;
    if(num > 26){
        let decena = Math.trunc(num / 26);
        if(num % 26 === 0) decena--;
        let unidad = num - (decena*26);

        return getColumn(decena-1) + getColumn(unidad-1);
    } else {
        return String.fromCharCode(FIRST_CHAR_CODE + Number(i));
    }
}

/**
 * Actualiza una celda específica en la hoja de cálculo con un nuevo valor y recalcula todas las celdas.
 * Esta función crea una copia profunda del estado actual de la hoja de cálculo, actualiza la celda objetivo en las coordenadas proporcionadas (`x`, `y`) con el nuevo `valor`, calcula un nuevo valor
 * para la celda basado en constantes proporcionadas y finalmente desencadena el recálculo y lare-renderización de todas las celdas.
 *
 * @param {Object} params - Los parámetros para la actualización.
 * @param {number} params.x - La coordenada x (fila) de la celda a actualizar.
 * @param {number} params.y - La coordenada y (columna) de la celda a actualizar.
 * @param {*} params.value - El nuevo valor que se establecerá en la celda.
 */
function updateCell({ x, y, value }) {
    const newState = structuredClone(STATE);
    const constants = generateCellsConstants(newState);

    const cell = newState[x][y]

    cell.computedValue = computeValue(value, constants);
    if (esNumero(value)){
        cell.value = parseInt(value);
    } else {
        cell.value = value;
    }

    newState[x][y] = cell;
    computeAllCells(newState);
    STATE = newState;
    renderSpreadSheet();
}

/**
 * Genera las constantes para todas las celdas de la hoja de cálculo.
 * Este método recorre todas las celdas de la hoja de cálculo y genera una cadena de textocon la forma `const <ID de celda> = <valor computado>;` para cada celda. El ID de la celda
 * sigue el formato de referencia de Excel (por ejemplo, A1, B2, etc.).
 *
 * @param {Array} cells - La matriz bidimensional que representa las celdas de la hoja de cálculo.
 * @returns {string} - Una cadena de texto que contiene las constantes generadas para cada celda.
 */
function generateCellsConstants(cells) {
    return cells.map((rows, x) => {
        return rows.map((cell, y) => {
            const letter = getColumn(x);
            const cellId = `${letter}${y + 1}`;
            return `const ${cellId} = ${cell.computedValue};`;
        }).join('\n')
    }).join('\n');
}

/**
 * Calcula los valores computados para todas las celdas de la hoja de cálculo.
 * Esta función recorre cada celda en la matriz de celdas y calcula su valor computado utilizando la función `computeValue` y las constantes proporcionadas. Luego, asigna
 * el valor computado a cada celda.
 *
 * @param {Array} cells - La matriz bidimensional que representa las celdas de la hoja de cálculo.
 * @param {string} constants - Las constantes generadas previamente para ser usadas en el cálculo de las celdas.
 */
function computeAllCells(cells) {
    cells.forEach((rows, x) => {
        rows.forEach((cell, y) => {
            const constants = generateCellsConstants(cells);
            const computedValue = computeValue(cell.value, constants);
            cell.computedValue = computedValue;
        })
    });
}

// Función SUMA que suma todos los valores numéricos
function suma(...args) {
    return args.reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
}

// Función PROMEDIO que calcula el promedio de los valores numéricos
function promedio(...args) {
    const validNumbers = args.filter(val => typeof val === 'number');
    return validNumbers.length ? suma(...validNumbers) / validNumbers.length : 0;
}

/**
 * Calcula el valor de una celda basado en su valor o fórmula, utilizando constantes generadas.
 * Esta función evalúa el valor de una celda. Si es un número, lo retorna directamente. Si el valor es una fórmula (empieza con `=`), la evalúa utilizando las constantes proporcionadas y devuelve el
 * resultado. Si ocurre algún error durante la evaluación de la fórmula, devuelve un mensaje de error.
 *
 * @param {any} value - El valor de la celda, que puede ser un número o una fórmula.
 * @param {string} constants - Las constantes generadas que pueden ser utilizadas en la evaluación de la fórmula.
 * @returns {*} - El valor calculado o un mensaje de error si la evaluación falla.
 */
function computeValue(value, constants) {
    if (esNumero(value)) return parseInt(value);
    if (!value.startsWith('=')) return value;

    const formula = value.slice(1).trim();

    const forbiddenChars = /[^0-9A-Za-z+\-*/().\s,%]/;
    if (forbiddenChars.test(formula)) {
        return '!ERROR: Invalid characters in formula';
    }

    let computedValue;
    try {
        const computeFunction = new Function('suma', 'promedio', `${constants} return ${formula};`);
        computedValue = computeFunction(suma, promedio);
    } catch (e) {
        computedValue = `!ERROR: ${e.message}`;
    }

    return computedValue;
}

const renderSpreadSheet = () => {
    const headerHTML = `<tr>
        <th></th>
        ${times(COLUMNS).map(i => `<th class="header-column" scope="col" >${getColumn(i)}</th>`).join('')}
    </tr>`;

    $head.innerHTML = headerHTML;

    const bodyHTML = times(ROWS).map(row => {
        return `<tr>
            <th class="header-row" scope="row" >${row + 1}</th>
            ${times(COLUMNS).map(column => `
            <td data-x="${column}" data-y="${row}">
            <span>${STATE[column][row].computedValue}</span>
            <input type="text" class="row-input" value="${STATE[column][row].value}" />
            </td>
            `).join('')}
        </tr>`
    }).join('');

    $body.innerHTML = bodyHTML;
}

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

$body.addEventListener('click', event => {
    const th = event.target.closest('th');
    
    if (!th) return;

    const y = [...th.parentNode.parentNode.children].indexOf(th.parentNode);
    if (y < 0) return;

    selectedColumn = y;

    $$('.selected').forEach(el => el.classList.remove('selected'));
    th.classList.add('selected');
    $$(`tr:nth-child(${y + 1}) td`).forEach(el => el.classList.add('selected'));
})

$body.addEventListener('dblclick', event => {
    const td = event.target.closest('td');
    if (!td) return;

    const { x, y } = td.dataset;
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
        //console.log({ value: input.value, state: STATE[x][y].value });
        if (input.value === STATE[x][y].value) return;

        updateCell({ x, y, value: input.value });
    }, { once: true });
})

function getIdCell(td) {
    if (!td) return;
    let id = '';
    const dataX = td.getAttribute('data-x');
    const dataY = td.getAttribute('data-y');

    id = `${getColumn(dataX)}${Number(dataY)+1}`;
    

    return id;
}

$body.addEventListener('click', event => {
    const td = event.target.closest('td');
    const showId = $('#showId');
    const showValue = $('#showValue');
    if (!td) return;

    const { x, y } = td.dataset;
    const input = td.querySelector('input');
    const span = td.querySelector('span');

    const end = input.value.length;
    input.setSelectionRange(end, end);
    //input.focus();
    
    $$('.selected').forEach(el => el.classList.remove('selected'));
    selectedColumn = null;
    
    td.classList.add('selected');
    showId.value = getIdCell(td);
    showValue.value = input.value;
})

document.addEventListener('keydown', event => {
    if (event.key === 'Backspace' && selectedColumn !== null) {
        times(ROWS).forEach(row => {
            updateCell({ x: selectedColumn, y: row, value: '' });
        });
        renderSpreadSheet();
    }
})

document.addEventListener('copy', event => {
    if (selectedColumn !== null) {
        const columnValues = times(ROWS).map(row => {
            return STATE[selectedColumn][row].computedValue;
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