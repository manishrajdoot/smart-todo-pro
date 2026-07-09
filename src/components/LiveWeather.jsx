import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, Sun, CloudRain, Wind, Droplets, Thermometer, MapPin, Loader2, CloudSnow, CloudLightning } from 'lucide-react';

const getWeatherIcon = (code) => {
  if (code === 0) return { icon: Sun, label: 'Clear', color: 'text-yellow-400' };
  if (code <= 3) return { icon: Cloud, label: 'Cloudy', color: 'text-gray-400' };
  if (code <= 20) return { icon: CloudRain, label: 'Rain', color: 'text-blue-400' };
  if (code <= 30) return { icon: CloudSnow, label: 'Snow', color: 'text-blue-200' };
  if (code <= 40) return { icon: CloudLightning, label: 'Storm', color: 'text-yellow-500' };
  return { icon: Cloud, label: 'Cloudy', color: 'text-gray-400' };
};

export default function LiveWeather({ location, setLocation }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto&daily=sunrise,sunset&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m`
      );
      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      
      const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1`);
      const geoData = await geoRes.json();
      const city = geoData.results?.[0]?.name || 'Your Location';
      const country = geoData.results?.[0]?.country || '';
      setLocation(`${city}, ${country}`);

      setWeather({
        ...data.current_weather,
        humidity: data.current?.relative_humidity_2m || 0,
        apparentTemp: data.current?.apparent_temperature || data.current_weather.temperature,
        windSpeed: data.current_weather.windspeed || 0,
        sunrise: data.daily?.sunrise?.[0] || '',
        sunset: data.daily?.sunset?.[0] || '',
      });
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load weather');
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(pos.coords.latitude, pos.coords.longitude),
      () => {
        // fallback IP
        fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .then(data => {
            if (data.latitude && data.longitude) fetchWeather(data.latitude, data.longitude);
            else throw new Error('IP fallback failed');
          })
          .catch(() => {
            setError('Could not get location');
            setLoading(false);
          });
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-3 bg-blue-50/50 dark:bg-gray-800/50 rounded-xl border border-blue-100 dark:border-gray-700">
        <Loader2 className="animate-spin text-blue-500" size={20} />
        <span className="ml-2 text-sm text-gray-500">Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm text-center">
        ⚠️ {error}
      </div>
    );
  }

  if (!weather) return null;

  const IconComponent = getWeatherIcon(weather.weathercode).icon;
  const iconColor = getWeatherIcon(weather.weathercode).color;
  const label = getWeatherIcon(weather.weathercode).label;
  const temp = Math.round(weather.temperature);
  const feelsLike = Math.round(weather.apparentTemp || weather.temperature);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 dark:from-gray-800/80 dark:to-gray-900/80 rounded-xl p-3 border border-blue-100 dark:border-gray-700"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MapPin size={16} className="text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{location}</span>
        </div>
        <span className="text-xs text-gray-400">{new Date().toLocaleTimeString()}</span>
      </div>
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3">
          <IconComponent size={32} className={iconColor} />
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-gray-800 dark:text-white">{temp}°</span>
              <span className="text-xs text-gray-400">C</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-300">{label}</p>
          </div>
        </div>
        <div className="text-right text-xs text-gray-500 dark:text-gray-300">
          <p>Feels {feelsLike}°</p>
          <div className="flex items-center gap-2 mt-1">
            <Wind size={14} className="text-blue-400" />
            <span>{Math.round(weather.windSpeed)} km/h</span>
          </div>
          <div className="flex items-center gap-2">
            <Droplets size={14} className="text-blue-400" />
            <span>{weather.humidity}%</span>
          </div>
        </div>
      </div>
      {(weather.sunrise || weather.sunset) && (
        <div className="flex justify-between mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-400">
          <span>🌅 {weather.sunrise ? new Date(weather.sunrise).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--'}</span>
          <span>🌇 {weather.sunset ? new Date(weather.sunset).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : '--'}</span>
        </div>
      )}
    </motion.div>
  );
}