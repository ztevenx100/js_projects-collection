// API Key (en un proyecto real, esto debería estar en el backend)
const API_KEY = 'YOUR_API_KEY_HERE';
const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Elementos del DOM
const searchForm = document.getElementById('search-form');
const cityInput = document.getElementById('city-input');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherData = document.getElementById('weather-data');
const cityName = document.getElementById('city-name');
const weatherIcon = document.getElementById('weather-icon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const humidity = document.getElementById('humidity');
const wind = document.getElementById('wind');

// Inicialización
window.addEventListener('DOMContentLoaded', () => {
    // Cargar la última ciudad buscada (si existe)
    const lastCity = localStorage.getItem('lastCity');
    if (lastCity) {
        getWeatherData(lastCity);
    }
});

// Event Listeners
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const city = cityInput.value.trim();
    
    if (!city) return;
    
    getWeatherData(city);
});

// Función para obtener los datos del clima
async function getWeatherData(city) {
    // Mostrar cargando y ocultar otros mensajes
    showLoading();
    
    try {
        // Construir URL con parámetros
        const url = `${API_URL}?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}&lang=es`;
        
        // Fetch API para obtener datos
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('No se pudo encontrar la ciudad');
        }
        
        const data = await response.json();
        
        // Guardar la ciudad en localStorage
        localStorage.setItem('lastCity', city);
        
        // Actualizar la UI con los datos
        updateWeatherUI(data);
        
    } catch (err) {
        showError();
        console.error('Error:', err);
    }
}

// Función para actualizar la interfaz con datos del clima
function updateWeatherUI(data) {
    const iconCode = data.weather[0].icon;
    const iconUrl = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    weatherIcon.src = iconUrl;
    weatherIcon.alt = data.weather[0].description;
    temperature.textContent = `${Math.round(data.main.temp)}°C`;
    description.textContent = data.weather[0].description;
    humidity.textContent = `${data.main.humidity}%`;
    wind.textContent = `${data.wind.speed} m/s`;
    
    showWeatherData();
}

// Funciones de control de visibilidad
function showLoading() {
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    weatherData.classList.add('hidden');
}

function showError() {
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    weatherData.classList.add('hidden');
}

function showWeatherData() {
    loading.classList.add('hidden');
    error.classList.add('hidden');
    weatherData.classList.remove('hidden');
}

// Función para demo (solo para mostrar la UI sin API key)
function demoMode() {
    // Datos de ejemplo
    const demoData = {
        name: 'Madrid',
        sys: { country: 'ES' },
        main: {
            temp: 22,
            humidity: 65
        },
        weather: [
            {
                icon: '01d',
                description: 'cielo despejado'
            }
        ],
        wind: { speed: 3.6 }
    };
    
    // Simular un retraso de carga
    showLoading();
    
    setTimeout(() => {
        updateWeatherUI(demoData);
    }, 1000);
}

// Activar modo demo cuando no hay API key
if (API_KEY === 'YOUR_API_KEY_HERE') {
    demoMode();
}
