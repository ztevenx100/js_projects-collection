document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdown-input');
  const markdownOutput = document.getElementById('markdown-output');
  const clearBtn = document.getElementById('clear-btn');
  const copyHtmlBtn = document.getElementById('copy-html-btn');

  function renderMarkdown() {
    const markdownText = markdownInput?.value;
    if (markdownText != null && markdownOutput) {
      markdownOutput.innerHTML = marked.parse(markdownText);
    }
  }

  markdownInput?.addEventListener('input', () => renderMarkdown());

  clearBtn?.addEventListener('click', () => {
    if (markdownInput) {
      markdownInput.value = '';
      renderMarkdown();
    }
  });

  copyHtmlBtn?.addEventListener('click', () => {
    if (markdownOutput && copyHtmlBtn) {
      navigator.clipboard.writeText(markdownOutput.innerHTML)
        .then(() => {
          const originalText = copyHtmlBtn.textContent;
          copyHtmlBtn.textContent = '¡Copiado!';
          setTimeout(() => {
            copyHtmlBtn.textContent = originalText;
          }, 2000);
        })
        .catch(err => {
          console.error('Error al copiar el HTML: ', err);
          alert('No se pudo copiar el HTML.');
        });
    }
  });

  // Carga inicial
  renderMarkdown();
});
