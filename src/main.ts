import './style.css'
import { io } from 'socket.io-client'

const socket = io('https://uno-production-354b.up.railway.app/');

const inputPseudo = document.querySelector<HTMLInputElement>(".input_pseudo");
const joinButton = document.querySelector<HTMLButtonElement>(".join");
const readyButton = document.querySelector<HTMLButtonElement>(".ready");
const playerList = document.createElement("ul");
const messagesContainer = document.createElement("div"); 
document.body.appendChild(playerList);
document.body.appendChild(messagesContainer);
readyButton!.style.display = "none";

let currentPlayerName: string | null = null;

function updatePlayerList(players: { name: string; ready: boolean }[]) {
  playerList.innerHTML = ""; 

  players.forEach(player => {
    const listItem = document.createElement("li");
    listItem.textContent = `${player.name} (${player.ready ? "ready" : "not ready"})`;
    playerList.appendChild(listItem);
  });
}

function displayMessage(message: string) {
  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messagesContainer.appendChild(messageElement);
}

joinButton!.addEventListener("click", () => {
  const playerName = inputPseudo!.value.trim();
  
  if (playerName) {
    currentPlayerName = playerName;
    socket.emit("joinGame", playerName); 
    console.log(`${playerName} joined the game.`);
    displayMessage(`${playerName} joined the game.`); 
    readyButton!.style.display = "block";
  }
});

readyButton!.addEventListener("click", () => {
  if (currentPlayerName) {
    socket.emit("playerReady", currentPlayerName); 
    console.log(`${currentPlayerName} is now ready.`);
    displayMessage(`${currentPlayerName} is now ready.`); 
  }
});

socket.on("updatePlayers", (players) => {
  updatePlayerList(players);
});
