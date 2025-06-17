// Elementos del DOM
const form = document.getElementById('password-form');
const lengthInput = document.getElementById('length');
const uppercaseInput = document.getElementById('uppercase');
const lowercaseInput = document.getElementById('lowercase');
const numbersInput = document.getElementById('numbers');
const symbolsInput = document.getElementById('symbols');
const resultInput = document.getElementById('result');
const copyBtn = document.getElementById('copy-btn');

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*()_+-={}[]|:;<>,.?/~';

function generatePassword(length, useUpper, useLower, useNum, useSym) {
    let chars = '';
    if (useUpper) chars += UPPERCASE;
    if (useLower) chars += LOWERCASE;
    if (useNum) chars += NUMBERS;
    if (useSym) chars += SYMBOLS;
    if (!chars) return '';

    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const length = parseInt(lengthInput.value, 10);
    const useUpper = uppercaseInput.checked;
    const useLower = lowercaseInput.checked;
    const useNum = numbersInput.checked;
    const useSym = symbolsInput.checked;
    const password = generatePassword(length, useUpper, useLower, useNum, useSym);
    resultInput.value = password;
});

copyBtn.addEventListener('click', () => {
    if (!resultInput.value) return;
    resultInput.select();
    document.execCommand('copy');
    copyBtn.innerHTML = '✅';
    setTimeout(() => {
        copyBtn.innerHTML = '<span>📋</span>';
    }, 1200);
});
