const scores ={1: 0, 2:0}
let currentPlayer=1;
let timeoutId;
let layer;
const correctSound = new Audio('./correct-sound.mp3');
let currentCountry ;
let gameActive = true; 
let drawnCountries = [];


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
    
    let currentCountry = getRandomCountry(countriesList);
    document.getElementById('country-name1').innerText = `Kliknij na: ${currentCountry}`;

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
          if (!gameActive) return;
          const clickedCountry = feature.properties.name;

          if (clickedCountry === currentCountry){
            scores[currentPlayer]++;
            document.getElementById('result'+currentPlayer).innerText ="Poprawna odpowiedź!"
            document.getElementById('result'+currentPlayer).style.color = 'green';
            document.getElementById('points'+currentPlayer).innerText =`Punkty: ${scores[currentPlayer]}`;            
            highlightCountry(layer, true)

            if (scores[currentPlayer] === 5) {
              document.getElementById('country-name1').innerText = `Gratulacje! Gracz ${currentPlayer} wygrał!!`;
              document.getElementById('country-name2').innerText = "Gra zakończona.";
              gameActive = false;  // Kończymy grę
              return;
            }

            currentCountry = getRandomCountry(countriesList);
            document.getElementById('country-name'+currentPlayer).innerText = `Kliknij na: ${currentCountry}!!`; 
           
          }
          else{
            document.getElementById('result'+currentPlayer).innerText =`Błędna odpowiedź, zaznaczyłeś ${clickedCountry}!!`;
            document.getElementById('result'+currentPlayer).style.color = 'red';
            document.getElementById('country-name'+currentPlayer).innerText = `Tura przeciwnika, poczekaj na swoja ture!!`; 
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            currentCountry = getRandomCountry(countriesList);
            document.getElementById('country-name'+currentPlayer).innerText = `Kliknij na: ${currentCountry}`;
            highlightCountry(layer, false)
          }
       
      

        });
      }
    }).addTo(map);
  })
  .catch(error => console.error('Błąd wczytywania pliku JSON:', error));





//FUNKCJE

// Funkcja do losowania kraju
function getRandomCountry(countriesList) {
  let availableCountries = countriesList.filter(country => !drawnCountries.includes(country));
  
  if (availableCountries.length === 0) {
    drawnCountries = [];  // Resetowanie, jeśli wszystkie kraje zostały już wylosowane
    availableCountries = countriesList.slice();
  }

  const randomIndex = Math.floor(Math.random() * availableCountries.length);
  const selectedCountry = availableCountries[randomIndex];
  drawnCountries.push(selectedCountry);  // Dodajemy kraj do listy już wylosowanych
  return selectedCountry;
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







