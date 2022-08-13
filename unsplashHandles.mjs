import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import 'dotenv/config' 

const UNS_API_CLIENTID = process.env.UNS_API_CLIENTID;
const OWM_API_KEY = process.env.OWM_API_KEY;
const STORMGLASS_API_KEY = process.env.STORMGLASS_API_KEY;

var PhotoUnsplash = null;
var Weather = null;
var RequestCounters = null;

const unsplash = createApi({
    accessKey: UNS_API_CLIENTID,
    fetch: nodeFetch,
});

export async function status() {
    return {
        unsplash: PhotoUnsplash,
        weather: Weather,
        counters: RequestCounters
    }
}

export async function unsplashHandler() {
    console.log('unsplashHandler running...');
    // first time server start, get weather data
    if(PhotoUnsplash === null){
        return await getUnsplash()
    }

    const nowTimeStamp = new Date().getTime();
    const timeToRefresh = (nowTimeStamp - PhotoUnsplash.timestamp) > 86400000;

    if(timeToRefresh){
        console.log('daily unsplash request')
        return await getUnsplash();
    }
    // cached return
    console.log('unsplash cached return :)')
    return PhotoUnsplash.list[Math.floor(Math.random() * PhotoUnsplash.list.length)];
}

export async function getUnsplash() {
    console.log('getUnsplash call...');
    const fotosSurf = await unsplash.photos.getRandom({
        query: 'surf',
        count: 24,
    })
    .then(result => result.response)
    
    const fotosKitesurf = await unsplash.photos.getRandom({
        query: 'kitesurf',
        count: 24,
    })
    .then(result => result.response)

    const fotosOcean = await unsplash.photos.getRandom({
        query: 'ocean',
        count: 24,
    })
    .then(result => result.response)

    const fotosCoast = await unsplash.photos.getRandom({
        query: 'coast',
        count: 24,
    })
    .then(result => result.response)

    if(PhotoUnsplash === null){
        PhotoUnsplash = {};
    }

    PhotoUnsplash = {
        timestamp: new Date().getTime(),
        list: [...fotosSurf, ...fotosKitesurf, ...fotosOcean, ...fotosCoast],
    }

    return PhotoUnsplash.list[Math.floor(Math.random() * PhotoUnsplash.list.length)];
}

export async function weatherhHandler(data) {
    // first time server start, get weather data
    if(Weather === null){
        return await getOpenWeather(data)
    }
    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };
    // first time for this 'ciudad'
    if(!Weather[cityName['normalized']].owm){
        return await getOpenWeather(data)
    }

    const nowTimeStamp = new Date().getTime();
    const wtimeToRefresh = (nowTimeStamp - Weather[cityName['normalized']].owm.timestamp) > 600000; // cada 10 min?
    // if this 'ciudad' cached is time to refresh
    if(wtimeToRefresh){
        return await getOpenWeather(data)
    }
    // cached return
    console.log('weather cached return for: ', cityName['normalized']);
    return Weather[cityName['normalized']];
}

export async function getOpenWeather(data) {
    console.log('getOpenWeather call...');

    const newTimestamp = new Date().getTime();

    const weather = await nodeFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=${OWM_API_KEY}&units=metric&lang=en`)
            .then(responseowm => responseowm.json())
            .catch(error => console.log(error));

    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };

    Weather[cityName['normalized']].owm = {
        timestamp: newTimestamp,
        weather: weather,
    }
    
    return Weather[cityName['normalized']]
}

export async function stormglasshHandler(data) {
    // first time server start, get weather data
    if(Weather === null){
        return await getStormGlass(data)
    }
    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };

    // first time for this 'ciudad'
    if(!Weather[cityName['normalized']] && !Weather[cityName['normalized']]?.stormglass && Weather.stormglass?.requestCount < 50){
        return await getStormGlass(data)
    }

    const nowTimeStamp = new Date().getTime();
    const wtimeToRefresh = (nowTimeStamp - Weather[cityName['normalized']].stormglass.timestamp) > 86400000; // cada 1 dia?
    // if this 'ciudad' cached is time to refresh
    if(wtimeToRefresh && Weather.stormglass.requestCount < 50){
        return await getStormGlass(data)
    }
    console.log('stormglass cached return for: ', cityName['normalized']);
    // cached return
    return Weather[cityName['normalized']].stormglass;
}

export async function getStormGlass(data) {
    console.log('getStormGlass call...');

    const newTimestamp = new Date().getTime();
    
    const params = "swellDirection,swellHeight,swellPeriod,secondarySwellDirection,secondarySwellHeight,secondarySwellPeriod,waterTemperature,waveDirection,waveHeight,wavePeriod"

    const stormglass = await nodeFetch(`https://api.stormglass.io/v2/weather/point?lat=${data.latitude}&lng=${data.longitude}&params=${params}&source=sg`, {
        headers: {
            'Authorization': `${STORMGLASS_API_KEY}`
        }
        })
        .then((response) => response.json())
        .catch(error => console.log(error));
    
    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };

    if(Weather === null){
        Weather = {
            stormglass: {},
        };
    }
    
    Weather.stormglass = stormglass.meta;

    Weather[cityName['normalized']] = {
        stormglass: {
            timestamp: newTimestamp,
            stormglass: [...stormglass.hours]
        }
    }
    console.log('stormglass cached meta: ', stormglass.meta);

    return Weather[cityName['normalized']].stormglass
}

export async function getStormGlassExtremeTides(data) {
    console.log('getStormGlassExtremeTides call...');

    const stormglassTides = await nodeFetch(`https://api.stormglass.io/v2/tide/extremes/point?lat=${data.latitude}&lng=${data.longitude}`, {
        headers: {
            'Authorization': `${STORMGLASS_API_KEY}`
        }
        })
        .then((response) => response.json())
        .catch(error => console.log(error));
    
    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };

    Weather[cityName['normalized']] = {
        stormglassTides: stormglassTides,
    }

    return Weather[cityName['normalized']].stormglassTides
}

export function requestCounterHandler(){
    // increment today request counter
    const nowTimeStamp = new Date().getTime();
    const today = new Date(nowTimeStamp).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
    if(!RequestCounters) {
        RequestCounters = {};
    }
    if(!RequestCounters[today]) {
        RequestCounters[today] = 0;
    }
    RequestCounters[today]++;
}