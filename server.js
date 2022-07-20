import geckos, { iceServers } from '@geckos.io/server'
// import { readFile } from 'fs/promises'
import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import { createServer } from 'http'
import { unsplashHandler, weatherhHandles } from "./unsplashHandles.mjs";

// create application/json parser
var jsonParser = bodyParser.json()

const app = express()
const server = createServer(app)

app.use(cors())

app.get('/', (req, res) => {
  try {
    return res.status(200).json({ description: "active connections available to read", state: activeConnections })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
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

const io = geckos({
  iceServers: process.env.NODE_ENV === 'production' ? iceServers : [],
  portRange: { min: 20000, max: 20100 },
})

io.addServer(server)

server.listen(3000, () => {
  console.log('server running on http://127.0.0.1:3000')
})

// connection list
var activeConnections = [];

io.onConnection((channel) => {
  channel.onDisconnect(() => {
    console.log(`${channel.id} got disconnected`)
    activeConnections.filter(c => c.channel_id !== channel.id)
  })

  channel.onDrop(drop => {
    if (drop['reason'] !== 'DROPPED_FROM_BUFFERING') {
      console.warn('We are dropping packets: ', drop);
    }
  });

  activeConnections.push({
    id: channel.id,
    status: 'init'
  });

  // emits a message to all channels, in the same room
  channel.on('home activity', async (data) => {
    channel.room.emit('home activity', data)
  });
})
