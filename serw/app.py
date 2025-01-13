import json
import random
from flask import Flask, render_template, request
from flask_socketio import SocketIO,  join_room, leave_room, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

# Lista połączonych graczy
connected_players = []

@app.route('/')
def index():
    return render_template('index.html')

game_state={
    'players': [None, None], 
    'turn': 1,  # Tura gracza
    'players_count': 0,  # Liczba graczy w grze
    'players_ready': False  # Flaga, czy obaj gracze są gotowi
}

current_country = None
game_turn=1




# Wczytaj plik GeoJSON
with open('e:/SIECIOWE/PROJEKTOWANIE-SIECIOWE/serw/geojson.json', 'r') as f:
    countries_data = json.load(f)

# Ekstrahujemy tylko nazwy krajów z GeoJSON
countries = [feature['properties']['name'] for feature in countries_data['features']]

# current_country = random.choice(countries)
player_points = {}

def draw_new_country():

    # Sprawdzenie, czy lista countries nie jest pusta
    if not countries:
        # Jeśli lista jest pusta, można ją ponownie załadować lub zakończyć grę
        return "Brak krajów do losowania"

    # Wylosowanie kraju z listy countries
    current_country = random.choice(countries)

    # Usunięcie wylosowanego kraju z listy, aby nie powtarzał się
    countries.remove(current_country)

   

    
    return current_country

# Obsługa kliknięcia kraju przez gracza
@socketio.on('country_clicked')
def handle_country_click(data):
    player_id = request.sid
    clicked_country = data.get('country')
    global current_country, game_turn
    # Sprawdzanie poprawności odpowiedzi
    correct = clicked_country == current_country

     # Sprawdź, czy to tura właściwego gracza
    if game_turn != data['role']:
        emit('invalid_turn', {'message': 'To nie jest Twoja tura!'}, room=player_id)
        return

    if correct:
        # Przyznawanie punktów
        player_points[player_id] = player_points.get(player_id, 0) + 1
        points = player_points[player_id]
        current_country = draw_new_country()
    else:
        points = player_points.get(player_id, 0)
        game_turn = 1 if game_turn == 2 else 2
        

    # Wysyłanie odpowiedzi do gracza
    emit('country_result', {
        'correct': correct,
        'country': clicked_country,
        'points': points,
        'newCountry': current_country,
        'gameTurn': game_turn
    }, broadcast=True)


@socketio.on('switchPlayer')
def switchPlayer():
    global current_country
    # Sprawdzenie, czy obaj gracze dołączyli
    if game_state['players_ready']:
        # Zmiana tury
        game_turn = 2 if game_turn == 1 else 1
        # Emitowanie zmiany tury do wszystkich graczy
        current_country = draw_new_country()
        emit('gameInfo', {'gameTurn': game_turn, 'currentCountry': current_country})
    else:
        # Jeśli drugi gracz się nie dołączył, losowanie nowego kraju, ale nie zmiana tury
        current_country = draw_new_country()
        emit('gameInfo', {'gameTurn': game_turn, 'currentCountry': current_country})




rooms = {}  # Słownik przechowujący informacje o pokojach

playersNames={'1':None, '2':None}

@socketio.on('joinRoom')
def on_join(data):
    global current_country
    room = data['room']
    sid = request.sid
    if(playersNames['1']==None):
        playersNames['1']=data['name']
    elif(playersNames['2']==None):
        playersNames['2']=data['name']


    if room not in rooms:
        rooms[room] = []

    rooms[room].append(sid)
    join_room(room)
    print(f"Client {sid} joined room {room}.")

    if len(rooms[room]) == 2:
        if current_country is None:  # Jeśli 'current_country' jest None, wylosuj nowy kraj
            current_country = draw_new_country()

        # Rozpocznij grę, gdy w pokoju są dwie osoby
        emit('gameStart', {'role': 1,'playersNames': playersNames,'currentCountry':current_country,'gameTurn':game_turn}, room=rooms[room][0])
        emit('gameStart', {'role': 2,'playersNames': playersNames,'currentCountry':current_country,'gameTurn':game_turn}, room=rooms[room][1])


@socketio.on('gameAction')
def on_game_action(data):
    room = data['room']
    emit('gameAction', data, room=room, include_self=False)


@socketio.on('disconnect')
def on_disconnect():
    sid = request.sid
    for room, players in rooms.items():
        if sid in players:
            players.remove(sid)
            leave_room(room)
            print(f"Client {sid} left room {room}.")
            
            # Resetowanie graczy w playersNames
            if playersNames['1'] == sid:
                playersNames['1'] = None
            elif playersNames['2'] == sid:
                playersNames['2'] = None
            
            if len(players) == 0:
                del rooms[room]
            break





if __name__ == '__main__':
    socketio.run(app, debug=True)
