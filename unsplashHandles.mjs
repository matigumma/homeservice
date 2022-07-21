import { createApi } from 'unsplash-js';
import nodeFetch from 'node-fetch';
import 'dotenv/config' 

const UNS_API_CLIENTID = process.env.UNS_API_CLIENTID;
const OWM_API_KEY = process.env.OWM_API_KEY;

console.log(UNS_API_CLIENTID)
console.log(OWM_API_KEY)

var PhotoUnsplash = null;
var WeatherOWM = null;

const unsplash = createApi({
    accessKey: UNS_API_CLIENTID,
    fetch: nodeFetch,
});

export async function unsplashHandler() {
    console.log('unsplashHandler running...');
    // first time server start, get weather data
    if(PhotoUnsplash === null){
        return await getUnsplash()
    }

    const nowTimeStamp = new Date().getTime();
    const timeToRefresh = (nowTimeStamp - PhotoUnsplash.timestamp) > 86400000;

    if(timeToRefresh){
        console.log('unsplash request')
        return await getUnsplash();
        // return PhotoUnsplash.list[Math.floor(Math.random()*PhotoUnsplash.list.length)];
        // return PhotoUnsplash.list;
    }
    // cached return
    console.log('unsplash cached return')
    // return PhotoUnsplash.list[Math.floor(Math.random()*PhotoUnsplash.list.length)];
    return PhotoUnsplash.list;
}

export async function getUnsplash(imageSearch = 'surf') {
    console.log('getUnsplash call...', imageSearch);
    const fotos = await unsplash.photos.getRandom({
        query: imageSearch,
        count: 24,
    })
    .then(result => result.response)

    if(PhotoUnsplash === null){
        PhotoUnsplash = {};
    }

    PhotoUnsplash = {
        timestamp: new Date().getTime(),
        list: fotos
    }

    return PhotoUnsplash.list;
}

export async function weatherhHandles(data) {
    // first time server start, get weather data
    if(WeatherOWM === null){
        return await getOpenWeather(data)
    }
    // first time for this 'ciudad'
    if(!WeatherOWM[data['ciudad']]){
        return await getOpenWeather(data)
    }

    const nowTimeStamp = new Date().getTime();
    const wtimeToRefresh = (nowTimeStamp - WeatherOWM[data['ciudad']].timestamp) > 1800000; // cada media hora?
    // if this 'ciudad' cached is time to refresh
    if(wtimeToRefresh){
        return await getOpenWeather(data)
    }
    // cached return
    console.log('weather cached return for: ', data['ciudad']);
    return WeatherOWM[data['ciudad']];
}

export async function getOpenWeather(data) {
    console.log('getOpenWeather call...');
    // const tmpF = await nodeFetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OWM_API_KEY}&units=metric&lang=en`)
    //     .then(response => response.json())

    // const tmpW = await nodeFetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&exclude=hourly,minutely,alerts&appid=${OWM_API_KEY}&units=metric&lang=en`)
    //         .then(responseowm => responseowm.json())

    // WeatherOWM = {
    //     timestamp: newTimestamp,
    //     forecast: tmpF,
    //     onecall: tmpW
    // }
    const newTimestamp = new Date().getTime();
    const lang = data.language.split('-')[0];

    const weather = await nodeFetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.latitude}&lon=${data.longitude}&appid=${OWM_API_KEY}&units=metric&lang=${lang}`)
            .then(responseowm => responseowm.json())
    
    if(WeatherOWM === null){
        WeatherOWM = {};
    }

    WeatherOWM[data['ciudad']] = {
        timestamp: newTimestamp,
        weather: weather,
    }
    return WeatherOWM[data['ciudad']]
}
