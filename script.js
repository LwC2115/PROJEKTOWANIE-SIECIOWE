let score = 0;  // Liczba punktów
let currentCountry = null;  // Aktualnie wybrany kraj do kliknięcia

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
    
    const layer = L.geoJSON(geojson, {
      style: function () {
        return {
          color: 'transparent', // Brak granic
          fillColor: 'transparent', // Brak wypełnienia
          weight: 0 // Brak grubości granic
        };
      },
      onEachFeature: function (feature, layer) {
        layer.on('click', function () {
          const clickedCountry = feature.properties.name;
          if (clickedCountry === currentCountry) {
            score++;
            console.log(score)
            currentCountry = getRandomCountry(countriesList); 
            document.getElementById('points').innerText = `Punkty: ${score}`;
            document.getElementById('country-name').innerText = `Kliknij na: ${currentCountry}`;
            document.getElementById('result').innerText = `Dobra odpowiedź! Kliknąłeś na ${clickedCountry}.`;
            document.getElementById('result').style.color = 'green';  // Zmieniamy kolor tekstu na zielony
          } else {
            document.getElementById('result').innerText = `Błąd! Kliknąłeś na ${clickedCountry}.`;
            document.getElementById('result').style.color = 'red';  // Zmieniamy kolor tekstu na czerwony
          }
        });
      }
    }).addTo(map);
  })
  .catch(error => console.error('Błąd wczytywania pliku JSON:', error));
// Funkcja do losowania kraju
function getRandomCountry(countriesList) {
  const randomIndex = Math.floor(Math.random() * countriesList.length);
  return countriesList[randomIndex];
}








// Wczytanie danych GeoJSON
// fetch('./geojson.json')
//   .then(response => response.json())
//   .then(geojson => {
//     const layer = L.geoJSON(geojson, {
//       style: function (feature) {
//         return {
//           color: 'transparent', // Brak koloru granic
//           fillColor: 'transparent', // Brak wypełnienia
//           weight: 0 // Brak grubości granic
//         };
//       },
//       onEachFeature: function (feature, layer) {
//         layer.on('click', function () {
//           const countryName = feature.properties.name;
//           document.getElementById('country-name').innerText = `Kliknąłeś na: ${countryName}`;
//         });
//       }
//     }).addTo(map);
//   })
//   .catch(error => console.error('Błąd wczytywania pliku JSON:', error));


  
  






// // Deklaracja zmiennych globalnych
// let kliknietyKraj = null;
// let liczbaKlikniec = 0;
// const listaKrajow = ["Polska", "Niemcy", "Francja", "Hiszpania"];
// let obecnyKrajIndex = 0;

// // Styl dla warstwy GeoJSON
// const myStyle = {
//   color: "#e1e2f2",
//   weight: 0,
//   opacity: 0.0
// };

// // Funkcja oczekiwania na kliknięcie kraju
// function waitForCountryClick() {
//   return new Promise(resolve => {
//     layer.on('click', event => {
//       resolve();
//     });
//   });
// }

// // Funkcja rozpoczęcia gry
// async function rozpocznijGre() {
//   liczbaKlikniec = 0;
//   document.getElementById('click-count').innerText = liczbaKlikniec;
//   aktualizujStatus(`Kliknij na ${listaKrajow[obecnyKrajIndex]}`);

//   for (let i = 0; i < listaKrajow.length; i++) {
//     obecnyKrajIndex = i;
//     const krajDoKlikniecia = listaKrajow[i];

//     // Oczekiwanie na kliknięcie użytkownika
//     await waitForCountryClick();

//     if (kliknietyKraj === krajDoKlikniecia) {
//       liczbaKlikniec++;
//       document.getElementById('click-count').innerText = liczbaKlikniec;
//     }

//     if (i < listaKrajow.length - 1) {
//       aktualizujStatus(`Kliknij na ${listaKrajow[i + 1]}`);
//     } else {
//       aktualizujStatus("Koniec gry");
//     }
//   }
// }

// // Funkcja aktualizacji statusu gry
// function aktualizujStatus(tekst) {
//   document.querySelectorAll("#status-box .column")[1].innerHTML = tekst;
// }

// // Dodanie przycisku "Rozpocznij grę"
// const kontener = document.getElementById("status-box");
// const przyciskStart = document.createElement("button");
// przyciskStart.textContent = "Rozpocznij grę";
// przyciskStart.addEventListener('click', rozpocznijGre);
// kontener.querySelectorAll('.column')[0].appendChild(przyciskStart);

// // Obsługa kliknięcia na kraj
// const layer = L.geoJSON(geojson, {
//   style: myStyle,
//   onEachFeature: function (feature, layer) {
//     layer.bindPopup(feature.properties.name);
//     layer.on('click', function () {
//       kliknietyKraj = feature.properties.name;

//       // Wysłanie informacji o kliknięciu na serwer
//       $.ajax({
//         url: '/test',
//         type: "POST",
//         contentType: 'application/json',
//         data: JSON.stringify({ kraj: kliknietyKraj }),
//         success: function () {
//           console.log(`Kliknięto: ${kliknietyKraj}`);
//         }
//       });
//     });
//   }



// }).addTo(map);
