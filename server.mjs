import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createServer } from 'http'
import { unsplashHandler, weatherhHandles, status } from "./unsplashHandles.mjs";

var jsonParser = bodyParser.json()

const app = express()
const server = createServer(app)

app.use(cors())

app.get('/', async (req, res) => {
    status()
    .then(status => {
      return res.status(200).json({ description: "status cached data", status: status })
    })
    .catch(error => {
      return res.status(500).json({ error: error.message })
    })
})

app.post('/weather', jsonParser,  async (req, res) => {
    console.log('weather req: ', req.body);

    weatherhHandles(req.body)
    .then(weatherData => {
      return res.status(200).json({ weather: weatherData })
    })
    .catch(error => {
      return res.status(500).json({ weather: null, error: error.message })
    })
})

app.get('/unsplash',  async (req, res) => {
    console.log('unsplash req ');
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
