const apiKey = "097d3b11fe3afc84539afbba886f570f"; // Replace with your OpenWeatherMap API key
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-btn');
const weatherVideo = document.getElementById('weatherVideo');

async function getWeather(city) {
    try {
        const [currentWeather, forecast] = await Promise.all([
            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`),
            fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`)
        ]);

        const weatherData = await currentWeather.json();
        const forecastData = await forecast.json();

        if (currentWeather.ok && forecast.ok) {
            displayWeather(weatherData);
            displayForecast(forecastData);
            updateBackgroundVideo(weatherData.weather[0].main);
        } else {
            alert('City not found. Please try again.');
        }
    } catch (error) {
        console.error('Error fetching weather data:', error);
        alert('Failed to fetch weather data. Please try again.');
    }
}

function displayWeather(data) {
    document.querySelector('.city').textContent = `Weather in ${data.name}`;
    document.querySelector('.temperature').textContent = `${Math.round(data.main.temp)}°C`;
    document.querySelector('.feels-like').textContent = `Feels like: ${Math.round(data.main.feels_like)}°C`;
    document.querySelector('.description').textContent = data.weather[0].description;
    
    // Update weather details
    const detailValues = document.querySelectorAll('.detail-value');
    detailValues[0].textContent = `${data.main.humidity}%`;
    detailValues[1].textContent = `${data.wind.speed} km/h`;
    detailValues[2].textContent = `${data.main.pressure} hPa`;
    detailValues[3].textContent = `${(data.visibility / 1000).toFixed(1)} km`;
}

function updateBackgroundVideo(weatherCondition) {
    const videoMappings = {
        Clear: 'videos/sunny.mp4',
        Clouds: 'videos/cloudy.mp4',
        Rain: 'videos/rain.mp4',
        Snow: 'videos/snow.mp4',
        Thunderstorm: 'videos/storm.mp4',
        Drizzle: 'videos/rain.mp4',
        Mist: 'videos/cloudy.mp4',
        Fog: 'videos/cloudy.mp4',
        default: 'videos/default.mp4'
    };

    const videoSource = videoMappings[weatherCondition] || videoMappings.default;
    const videoElement = document.querySelector('#weatherVideo source');
    videoElement.src = videoSource;
    weatherVideo.load();
}

function displayForecast(data) {
    const forecastContainer = document.querySelector('.forecast-items');
    forecastContainer.innerHTML = '';

    // Get one forecast per day (excluding current day)
    const dailyForecasts = data.list.filter(forecast => {
        const forecastDate = new Date(forecast.dt * 1000);
        const currentDate = new Date();
        return forecastDate.getDate() !== currentDate.getDate();
    }).reduce((unique, forecast) => {
        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();
        if (!unique.some(item => new Date(item.dt * 1000).toLocaleDateString() === forecastDate)) {
            unique.push(forecast);
        }
        return unique;
    }, []).slice(0, 5);  // Changed from 5 to 7 days

    dailyForecasts.forEach(forecast => {
        const date = new Date(forecast.dt * 1000);
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        forecastItem.innerHTML = `
            <div class="forecast-date">${dayName}<br>${monthDay}</div>
            <div class="forecast-temp">${Math.round(forecast.main.temp)}°C</div>
            <div class="forecast-description">${forecast.weather[0].description}</div>
        `;
        forecastContainer.appendChild(forecastItem);
    });
}

// Event listeners
searchButton.addEventListener('click', () => {
    const city = searchInput.value.trim();
    if (city) getWeather(city);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = searchInput.value.trim();
        if (city) getWeather(city);
    }
});

// Load default city weather
window.addEventListener('load', () => {
    getWeather('Jasidih');
});