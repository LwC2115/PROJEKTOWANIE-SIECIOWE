let score=0;
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let currentPlayerIs1=true;
let currentCountry = null;  // Aktualnie wybrany kraj do kliknięcia
let timeoutId;
let layer;
const correctSound = new Audio('./correct-sound.mp3');

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

const key = 'ImbDAV6SSQGc7KIfolvS'; // Twój klucz API
// Dodanie warstwy MapTiler z niestandardowym stylem
const mtLayer = L.maptilerLayer({
    apiKey: key,
    style: "https://api.maptiler.com/maps/ee09e5f2-3540-4c73-952c-90f72aacfbbd/style.json?key=" + key
}).addTo(map);



fetch('./geojson.json')
  .then(response => response.json())
  .then(geojson => {
    const countriesList = geojson.features.map(feature => feature.properties.name);
    
    currentCountry = getRandomCountry(countriesList);
    document.getElementById('country-name').innerText = `Kliknij na: ${currentCountry}`;
    
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
          const clickedCountry = feature.properties.name;
          if (clickedCountry === currentCountry) {
            if(currentPlayerIs1=true)
            score++;
            currentCountry = getRandomCountry(countriesList); 
            document.getElementById('points').innerText = `Punkty: ${score}`;
            document.getElementById('country-name').innerText = `Kliknij na: ${currentCountry}`;
            document.getElementById('result').innerText = `Dobra odpowiedź! Kliknąłeś na ${clickedCountry}.`;
            document.getElementById('result').style.color = 'green';  // Zmieniamy kolor tekstu na zielony
            highlightCountry(layer, true);
            correctSound.play();
          } else {
            document.getElementById('result').innerText = `Błąd! Kliknąłeś na ${clickedCountry}.`;
            document.getElementById('result').style.color = 'red';  // Zmieniamy kolor tekstu na czerwony
            highlightCountry(layer, false);
        }
        });
      }
    }).addTo(map);
  })
  .catch(error => console.error('Błąd wczytywania pliku JSON:', error));





//FUNKCJE

// Funkcja do losowania kraju
function getRandomCountry(countriesList) {
  const randomIndex = Math.floor(Math.random() * countriesList.length);
  return countriesList[randomIndex];
}

function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    document.getElementById('status-box').innerText = `Gracz ${currentPlayer}'s tura!`;
}

function updateCountry() {
    currentCountry = getRandomCountry(countriesList);
    document.getElementById('country-name').innerText = `Kliknij na: ${currentCountry}`;
    document.getElementById('result').innerText = `Gracz ${currentPlayer} - czekaj na swój ruch!`;
}

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
        
    }
    
    else {
        layer.setStyle({
            fillColor: 'red',
            fillOpacity: 0.7
        });
       
    }
}

function resetMap() {
    // Resetowanie wszystkich krajów
    layer.eachLayer(function (layer) {
        layer.setStyle({
            fillColor: 'transparent',
            fillOpacity: 0
        });
    });
}







