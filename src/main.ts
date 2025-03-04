import "./style.css";
import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

const isReadyElement = document.querySelector<HTMLElement>(".isready");
const inputPseudo = document.querySelector<HTMLInputElement>(".input_pseudo");
const joinButton = document.querySelector<HTMLButtonElement>(".join");
const readyButton = document.querySelector<HTMLButtonElement>(".ready");

const playerList = document.createElement("ul");
const messagesContainer = document.createElement("div");
document.body.appendChild(playerList);
document.body.appendChild(messagesContainer);
readyButton!.style.display = "none"; 

let currentPlayerId: string | null = null;
let currentPlayerName: string | null = null;

interface Player {
  id: string;
  name: string;
  isReady: boolean;
}

function updatePlayerList(players: Player[]) {
  console.log("Updated players list received:", players); // Debugging log

  // Récupérer le <ul> et vider la liste actuelle
  playerList.innerHTML = "";

  // Boucle pour chaque joueur
  players.forEach((player) => {
    // Créer un élément <li>
    const listItem = document.createElement("li");

    // Ajouter le nom du joueur + état (ready / not ready)
    listItem.textContent = `${player.name} (${player.isReady ? "ready" : "not ready"})`;

    // Ajouter le <li> au <ul>
    playerList.appendChild(listItem);
  });
}


function displayMessage(message: string) {
  const messageElement = document.createElement("div"); 
  messageElement.textContent = message;
  messagesContainer.appendChild(messageElement);
}

joinButton!.addEventListener("click", () => {
  const playerName = inputPseudo!.value.trim();

  if (playerName) {
    currentPlayerName = playerName;
    socket.emit("joinGame", playerName);
    console.log(`${playerName} joined the game.`);
    readyButton!.style.display = "block"; 
  }
});

readyButton!.addEventListener("click", () => {
  if (currentPlayerId) {
    console.log(`Emitting playerReady event for: ${currentPlayerName}`);
    socket.emit("playerReady");
  }
});


socket.on("joinGameStatus", (message: { message: string }) => {
  console.log(message.message);
  if (isReadyElement) {
    isReadyElement.innerText = message.message;
  }
});


socket.on("updatePlayers", (players: Player[]) => {
  console.log("Received players update from server:", players);


  const currentPlayer = players.find((player) => player.name === currentPlayerName);
  if (currentPlayer) {
    currentPlayerId = currentPlayer.id;
  }

  updatePlayerList(players);
});


socket.on("gameStart", ({ players, currentPlayer, discardPile }) => {
  console.log("Game has started!", { players, currentPlayer, discardPile });
  displayMessage("The game has started!");
  readyButton!.style.display = "none"; 
})


socket.on("gameStart", ({ players, discardPile, currentPlayer }) => {
  console.log("Game started!", players, discardPile, currentPlayer);

  const myPlayer = players.find(player => player.id === socket.id);
  
  if (!myPlayer) {
    console.error("Erreur : joueur introuvable");
    return;
  }

  updatePlayerHand(myPlayer.hand);

 
  displayDiscardPile(discardPile);


  updateGameState(players, currentPlayer);
});


function updatePlayerHand(hand: Card[]) {
  const handContainer = document.querySelector(".hand");
  if (!handContainer) return;
  handContainer.innerHTML = ""; 

  hand.forEach(card => {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.textContent = `${card.color} ${card.value}`;
    handContainer.appendChild(cardElement);
  });
}


function displayDiscardPile(discardPile: Card[]) {
  const discardContainer = document.querySelector(".discard-pile");
  if (!discardContainer) return;
  
  const lastCard = discardPile[discardPile.length - 1]; 
  discardContainer.innerHTML = `<div class="card">${lastCard.color} ${lastCard.value}</div>`;
}


function updateGameState(players: Player[], currentPlayerIndex: number) {
  const gameStateContainer = document.querySelector(".game-state");
  if (!gameStateContainer) return;

  gameStateContainer.innerHTML = `C'est au tour de ${players[currentPlayerIndex].name} de jouer !`;
}
