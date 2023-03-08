import bot from './assets/bot.svg'
import user from './assets/user.svg'

const form = document.querySelector('form')
const chatContainer = document.querySelector('#chat_container')
const placeHolderText = "Type your response here..."

let loadInterval;
let clientMessages = [];

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    element.textContent += '.';
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300)
}

function typeText(element, text) {
  let index = 0;
  const interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20)
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return (
    `
  <div class="wrapper ${isAi && 'ai'}">
    <div class="chat">
      <div class="profile">
        <img
          src="${isAi ? bot : user}"
          alt="${isAi ? 'bot' : 'user'}"
        />
      </div>
      <div class="message" id=${uniqueId}>${value}</div>
    </div>
  </div>
  `
  )
}

function removeCharacterLabels(text) {
  let newText = text.replace("Me: ", "");
  if (newText.includes("Prompt:")) { 
    newText = newText.replace("SynthProv: ", "\n");
  } else {
    newText = newText.replace("SynthProv: ", "");
  }
  return newText;
}

const handleSubmit = async (e) => {
  // console.log("submit");

  e.preventDefault();
  const data = new FormData(form);
  let userInput = removeCharacterLabels(data.get('prompt'));
  if(clientMessages.length === 0 && userInput != '') {
    userInput = "Prompt: " + userInput.replace("Prompt:", "");
  }

  // user's chatstripe
  clientMessages.push(
    {role: "user", content: ("Me: " + userInput)}
  );
  if(userInput !== '') {
    chatContainer.innerHTML += chatStripe(false, userInput);
  }

  form.reset();
  document.querySelector('textarea').placeholder = placeHolderText;

  // bot's chatstripe
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatStripe(true, '', uniqueId);
  chatContainer.scrollTop = chatContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);
  loader(messageDiv);

  // fetch data from server -> bot's response
  // console.log("client - clientMessages", clientMessages);
  const response = await fetch('http://localhost:5555', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: clientMessages
    })
  });
  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    // console.log("client - parsedData", parsedData);
    clientMessages.push(
      {role: "assistant", content: parsedData}
    );
    typeText(messageDiv, removeCharacterLabels(parsedData));
  } else {
    const err = await response.text();
    messageDiv.innerHTML = "Something went wrong.";
    alert(err);
  }
}

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});