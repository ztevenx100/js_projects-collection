// Elementos del DOM
const qrForm = document.getElementById('qr-form');
const qrText = document.getElementById('qr-text');
const qrSize = document.getElementById('qr-size');
const qrResult = document.getElementById('qr-result');
const downloadBtn = document.getElementById('download-btn');

let qr;

qrForm.addEventListener('submit', function(e) {
    e.preventDefault();
    generateQR();
});

downloadBtn.addEventListener('click', function() {
    if (!qr) return;
    const link = document.createElement('a');
    link.href = qr.toDataURL();
    link.download = 'qr-code.png';
    link.click();
});

function generateQR() {
    const text = qrText.value.trim();
    const size = parseInt(qrSize.value, 10);
    if (!text) return;

    qrResult.innerHTML = '';
    qr = new QRious({
        value: text,
        size: size,
        background: 'white',
        foreground: '#222',
        level: 'H'
    });
    qrResult.appendChild(qr.image);
    downloadBtn.style.display = 'inline-block';
}
