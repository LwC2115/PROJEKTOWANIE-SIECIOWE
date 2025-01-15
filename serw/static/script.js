// Inicjalizacja mapy
const map = L.map('map', {
  center: [44.550637, 20.562380], // Współrzędne dla centrum mapy
  zoom: 4, // Początkowy poziom zoomu
  minZoom: 3,
  maxZoom: 7,
  maxBounds: [
      [90, -180],  // Północny-wschód
      [-90, 180]   // Południowy-zachód
  ],
  worldCopyJump: false,
  maxBoundsViscosity: 1.0, // Zapobiega przesuwaniu mapy poza wyznaczone granice
});

// Klucz API dla MapTiler
const key = 'ImbDAV6SSQGc7KIfolvS'; 

// Dodanie warstwy MapTiler z niestandardowym stylem
const mtLayer = L.maptilerLayer({
  apiKey: key,
  style: "https://api.maptiler.com/maps/ee09e5f2-3540-4c73-952c-90f72aacfbbd/style.json?key=" + key
}).addTo(map);

let currentCountry='';
let geoJsonLayer;
let clickedCountry;
let clickedLayer = null;
// Ładowanie pliku geojson.json
fetch('/static/geojson.json')
.then(response => response.json())
.then(geojson => {
  
 layer = L.geoJSON(geojson, {
    style: function () {
      return {
        color: 'transparent', 
        fillColor: 'transparent',
        weight: 0 
      };
    },

    onEachFeature: function (feature, layer) {
      layer.on('click', function () {
        clickedCountry = feature.properties.name;
        clickedLayer = layer;
        sendCountryClick(clickedCountry);
      });
    }
  }).addTo(map);
})
.catch(error => console.error('Błąd wczytywania pliku JSON:', error));


// Połączenie z serwerem WebSocket
const socket = io.connect('http://localhost:5000');
let playerJoined = [false, false];  // Flagi sprawdzające, czy gracze dołączyli
let gameStarted = false;
let rolePlayer;
const correctSound = new Audio('E:\SIECIOWE\PROJEKTOWANIE-SIECIOWE\serw\static\correct-sound.mp3');


// Funkcja do wysyłania klikniętego kraju na serwer
function sendCountryClick(clickedCountry) {
   if (!gameStarted) {
        alert('Czekaj na drugiego gracza!');
        return;  // Nie pozwól na kliknięcie, jeśli gra jeszcze nie zaczęła
    }
    socket.emit('country_clicked', { country: clickedCountry,role:rolePlayer });
}
socket.on('country_result', (data) => {


  const resultBoxSelf = document.getElementById('result1');
  const resultBoxOpponent = document.getElementById('result2');

  const pointsBoxSelf = document.getElementById('points1');
  const pointsBoxOpponent = document.getElementById('points2');

  const countryNameBoxSelf = document.getElementById('country-name1');
  const countryNameBoxOpponent = document.getElementById('country-name2');

  // Sprawdzenie, czyja jest tura
  const isPlayerTurn = data.gameTurn === rolePlayer;
  console.log(rolePlayer)
  if (isPlayerTurn) {
    // Tura gracza
    if (data.correct) {
      resultBoxSelf.innerHTML = `Brawo! <span class="highlight-true">${data.country}</span> to poprawna odpowiedź!`;
      pointsBoxSelf.textContent = `Punkty: ${data.points}`;
      countryNameBoxSelf.innerHTML = `Kliknij na <span class="highlight">${data.newCountry}</span>`;
      highlightCountry(clickedLayer,true)
    } else {
      resultBoxSelf.innerHTML = `Niestety, <span class="highlight-false">${data.country}</span> to błędna odpowiedź.`;
      countryNameBoxSelf.innerHTML ='Czekaj na swoja ture';
      countryNameBoxOpponent.innerHTML=`Przeciwnik musi kliknąć <span class="highlight">${data.newCountry}</span>`;
      socket.emit('switchPlayer')
      highlightCountry(clickedLayer,false)
    }
  } else {
    // Tura przeciwnika
    if (data.correct) {
      resultBoxOpponent.innerHTML = `Przeciwnik poprawnie zaznaczył: <span class="highlight-true">${data.country}</span>!`;
      pointsBoxOpponent.textContent = `Punkty: ${data.points}`;
      countryNameBoxOpponent.innerHTML = `Przeciwnik musi kliknąć <span class="highlight">${data.newCountry}</span>`;

    } else {
      resultBoxOpponent.innerHTML = `Przeciwnik się pomylił, zaznaczył: <span class="highlight-false">${data.country}</span>.`;
      countryNameBoxOpponent.innerHTML='Czeka na swoją ture'
      countryNameBoxSelf.innerHTML = `Kliknij na <span class="highlight">${data.newCountry}</span>`;
    }
  }
  
});



function highlightCountry(layer, isCorrect) {
  if (isCorrect) {
      layer.setStyle({
          fillColor: 'green',
          fillOpacity: 0.7,
      });

      if (timeoutId) {
          clearTimeout(timeoutId);  // Wyczyść poprzedni timeout
      }
      timeoutId = setTimeout(function () {
          resetMap(); // Resetowanie mapy po 3 sekundach
      }, 500);
      correctSound.play();
  }
  
  else {
      layer.setStyle({
          fillColor: 'red',
          fillOpacity: 0.7
      });
     resetMap();
     
  }
}
let timeoutId;
function resetMap() {
if (timeoutId) {
  clearTimeout(timeoutId);  // Wyczyść poprzedni timeout
}
timeoutId = setTimeout(function () {
  layer.eachLayer(function (layer) {
    layer.setStyle({
      fillColor: 'transparent',
      fillOpacity: 0
    });
  }); 
}, 500);
}

const roomName = prompt("Enter the room name to join:");
socket.emit('joinRoom', { room: roomName, name: `Gracz_${Math.floor(Math.random() * 1000)}`});

socket.on('gameStart', (data) => {
  gameStarted = true;
  rolePlayer=data.role
  // Ustawienia nazw graczy
  const playerBox1 = document.getElementById('playerName1');
  const playerBox2 = document.getElementById('playerName2');

  if (data.role === 1) {
    playerBox1.textContent = `Gracz 1: ${data.playersNames['1']}`;
    playerBox2.textContent = `Gracz 2: ${data.playersNames['2']}`;
  } else {
    playerBox1.textContent = `Gracz 1: ${data.playersNames['2']}`;
    playerBox2.textContent = `Gracz 2: ${data.playersNames['1']}`;
  }

  // Aktualizacja instrukcji dla graczy
  const updateInstructions = (turn, currentCountry) => {
    const countryBox1 = document.getElementById('country-name1');
    const countryBox2 = document.getElementById('country-name2');

    if (rolePlayer === turn) {
      countryBox1.innerHTML = `Kliknij na <span class="highlight">${currentCountry}</span>`;
      countryBox2.innerHTML = `Czeka na swoją turę`;
    } else {
      countryBox1.innerHTML = `Czekaj na swoją turę`;
      countryBox2.innerHTML = `Drugi gracz musi kliknąć na <span class="highlight">${currentCountry}</span>`;
    }
  };

  // Ustaw komunikaty w zależności od tury
  updateInstructions(data.gameTurn, data.currentCountry);


    // document.getElementById('result'+1).textContent = `Czekaj na drugiego gracza`;

    alert(`Game started! You are ${data.role}`);
    // Rozpocznij grę
});

socket.on('gameAction', (data) => {
    console.log('Game action received:', data);
});

// Przykład wysłania akcji gry
function sendGameAction(action) {
    socket.emit('gameAction', {
        room: roomName,
        action: action,
    });
}

socket.on('invalid_turn', (data) => {
  alert(data.message); // Wyświetl komunikat o błędzie
});




