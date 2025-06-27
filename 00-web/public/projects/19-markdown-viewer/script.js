document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdown-input');
  const markdownOutput = document.getElementById('markdown-output');

  function renderMarkdown() {
    const markdownText = markdownInput?.value;
    if(markdownText) markdownOutput.innerHTML = marked.parse(markdownText);
  }

  markdownInput?.addEventListener('input', () => renderMarkdown());

  // Initial render
  renderMarkdown();
});
