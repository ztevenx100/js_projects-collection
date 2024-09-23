/** 
 * No se usa "https://esm.run/@mlc-ai/web-llm" porque el problema es que eso siempre es la versión más reciente
 * en el código se uso https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm para fijar la versión 
*/
import { CreateWebWorkerMLCEngine } from "https://cdn.jsdelivr.net/npm/@mlc-ai/web-llm@0.2.46/+esm";

const $ = el => document.querySelector(el);
const $$ = el => document.querySelectorAll(el);

const $form = $('form');
const $input = $('input');
const $template = $('#message-template');
const $messages = $('ul');
const $container = $('article');
const $button = $('button');
const $info = $('small');
const $loading = $('.loading');

let messages = [];
let end = false;

const SELECTED_MODEL = 'Llama-3-8B-Instruct-q4f32_1-MLC-1k';

const engine = await CreateWebWorkerMLCEngine(
  new Worker('./worker.js', { type: 'module' }),
  SELECTED_MODEL,
  {
    initProgressCallback: (info) => {
      console.log('init',info);
      
      $info.textContent = info.text
      if (info.progress === 1 && !end) {
        end = true
        $loading?.parentNode?.removeChild($loading)
        $button.removeAttribute('disabled')
        addMessage("¡Hola! Soy un ChatGPT que se ejecuta completamente en tu navegador. ¿En qué puedo ayudarte hoy?", 'bot')
        $input.focus()
      }
    }
  }
)

$form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const messageText = $input.value.trim();

  if (messageText !== '') {
    // añadimos el mensaje en el DOM
    $input.value = '';
  }

  addMessage(messageText, 'user');
  $button.setAttribute('disabled', '');

  const userMessage = {
    role: 'user',
    content: messageText
  }

  messages.push(userMessage);

  const chunks = await engine.chat.completions.create({
    messages,
    stream: true
  })

  let reply = "";

  const $botMessage = addMessage("", 'bot');

  for await (const chunk of chunks) {
    const choice = chunk.choices[0];
    const content = choice?.delta?.content ?? "";
    reply += content;
    $botMessage.textContent = reply;
  }

  $button.removeAttribute('disabled');
  messages.push({
    role: 'assistant',
    content: reply
  })
  $container.scrollTop = $container.scrollHeight;
})

function addMessage(text, sender) {
  // clonar el template
  const clonedTemplate = $template.content.cloneNode(true);
  const $newMessage = clonedTemplate.querySelector('.message');

  const $who = $newMessage.querySelector('span');
  const $text = $newMessage.querySelector('p');

  $text.textContent = text;
  $who.textContent = sender === 'bot' ? 'GPT' : 'Tú';
  $newMessage.classList.add(sender);

  $messages.appendChild($newMessage);

  $container.scrollTop = $container.scrollHeight;

  return $text;
}