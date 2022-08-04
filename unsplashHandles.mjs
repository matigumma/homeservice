import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import 'dotenv/config' 

const UNS_API_CLIENTID = process.env.UNS_API_CLIENTID;
const OWM_API_KEY = process.env.OWM_API_KEY;

var PhotoUnsplash = null;
var WeatherOWM = null;

const unsplash = createApi({
    accessKey: UNS_API_CLIENTID,
    fetch: nodeFetch,
});

export async function status() {
    return {
        unsplash: PhotoUnsplash,
        weather: WeatherOWM,
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

export async function weatherhHandles(data) {
    // first time server start, get weather data
    if(WeatherOWM === null){
        return await getOpenWeather(data)
    }
    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };
    // first time for this 'ciudad'
    if(!WeatherOWM[cityName['normalized']]){
        return await getOpenWeather(data)
    }

    const nowTimeStamp = new Date().getTime();
    const wtimeToRefresh = (nowTimeStamp - WeatherOWM[cityName['normalized']].timestamp) > 600000; // cada 10 min?
    // if this 'ciudad' cached is time to refresh
    if(wtimeToRefresh){
        return await getOpenWeather(data)
    }
    // cached return
    console.log('weather cached return for: ', cityName['normalized']);
    return WeatherOWM[cityName['normalized']];
}

export async function getOpenWeather(data) {
    console.log('getOpenWeather call...');

    const newTimestamp = new Date().getTime();

    const weather = await nodeFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=${OWM_API_KEY}&units=metric&lang=en`)
            .then(responseowm => responseowm.json())
    
    if(WeatherOWM === null){
        WeatherOWM = {};
    }

    const cityName = {
        normalized: String(data['ciudad']).toLowerCase().trim()
    };

    WeatherOWM[cityName['normalized']] = {
        timestamp: newTimestamp,
        weather: weather,
    }
    return WeatherOWM[cityName['normalized']]
}
