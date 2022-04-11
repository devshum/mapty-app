'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];


let map, mapEvent;
class Workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);

  constructor(cords, distance, duration) {
    // this.date = ...
    // this.id = ...
    this.cords = cords;
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  #pace;
  type = 'running';

  constructor(cords, distance, duration, elevationGain) {
    super(cords, distance, duration);
    this.elevationGain = elevationGain;
    this._calcPace();
  }

  _calcPace() {
    // min/kem
    this.#pace = this.duration / this.distance;
  }
}

class Cycling extends Workout {
  #speed
  type = 'cycling';

  constructor(cords, distance, duration, cadence) {
    super(cords, distance, duration);
    this.cadence = cadence;
    this._calcSpeed();
  }

  _calcSpeed() {
    // km/h
    this.#speed = this.distance / (this.duration) / 60;
  }
} 

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    this._toggleElevationField();
    form.addEventListener('submit', this._newWorkout.bind(this));
  }

  _getPosition() {
    if(navigator.geolocation) {
      navigator.geolocation
      .getCurrentPosition(this._loadMap.bind(this), () => alert('Could not get your position'));
    };    
  };

  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [ latitude, longitude ];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
      form.classList.remove('hidden');
      inputDistance.focus();
  }

  _toggleElevationField() {
    inputType.addEventListener('change', () => {
      inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
      inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    });
  }

  _newWorkout(e) {
    const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input))

    const allPositive = (...inputs) => inputs.every(input => input > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If activity running, create running object
    if(type === 'running') {
      const cadence = +inputCadence.value;
      // Check if data is valid
      if(
         // Number.isFinite(distance) ||
         // Number.isFinite(duration) ||
         // Number.isFinite(cadence)
         !validInputs(distance, duration, cadence) ||
         !allPositive(distance, duration, cadence)
      ) 
        return alert('Inputs have to be positive numbers')

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If activity cycling, create cycling object
    if(type === 'cycling') {
      const elevation = +inputElevation.value;

      if(
         !validInputs(distance, duration, elevation) ||
         !allPositive(distance, duration)
      ) 
       return alert('Inputs have to be positive numbers')

       workout = new Running([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Render workout on map as marker
    console.log(workout);

    this._renderWorkoutMarker(workout);

    // Render workout on list

    // Hide form / clear input fields

    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = '';
  
   
  }

  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
    .addTo(this.#map)
    .bindPopup(L.popup({
      maxWidth: 250,
      minWidth: 100,
      autoClose: false,
      closeOnClick: false,
      className: 'workout'
    }))
    .setPopupContent('Workout')
    .openPopup();
  }
}

const app = new App();