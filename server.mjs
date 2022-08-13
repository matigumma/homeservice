import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createServer } from 'http'
import { unsplashHandler, weatherhHandler, status, stormglasshHandler, requestCounterHandler } from "./unsplashHandles.mjs";

var jsonParser = bodyParser.json()

const app = express()
const server = createServer(app)

app.use(cors())

app.get('/cached', async (req, res) => {
  console.log('debug cached req');
  status()
  .then(cached => {
    return res.status(200).json({ description: "api cached data", cache: cached })
  })
  .catch(error => {
    return res.status(500).json({ error: error.message })
  })
})

app.post('/weather', jsonParser,  async (req, res) => {
  requestCounterHandler()

  stormglasshHandler(req.body)// hace request a stormglass y guarda el resultado en cache 
  .then(() => {
    weatherhHandler(req.body)// hace request a openweather y devuelve el resultado actualizado
    .then(weatherData => {
      return res.status(200).json({ weather: weatherData })
    })
    .catch(error => {
      return res.status(500).json({ weather: null, error: error.message })
    })
  })
  .catch(error => {
    return res.status(500).json({ weather: null, error: error.message })
  })
})

app.get('/unsplash',  async (req, res) => {
  unsplashHandler()
  .then(unsplashData => {
    return res.status(200).json({ unsplashData })
  })
  .catch(error => {
    return res.status(500).json({ unsplashData: null, error: error.message })
  })
})

server.listen(3000, () => {
  console.log('server running on http://127.0.0.1:3000')
})
