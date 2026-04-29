// Imports
import express from 'express'
import session from 'express-session'
import path from 'node:path'
import fetch from 'node-fetch'

import config from './config.json' with { type: 'json' }
import { fileURLToPath } from 'node:url'

// Constants
const { host, port } = config

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Server configuration
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Static
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: "supersecretkey",
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

app.use(express.static('public'))
app.use('/styles', express.static('public/styles'));

// Paths
app.get('/', async (req, res) => {
    res.redirect('/etusivu')
})

app.get('/etusivu', async (req, res) => {
    res.render('etusivu', { path: req.path })
})

app.get('/sukupolvi/:numero', async (req, res) => {
    const numero = req.params.numero

    const vastaus = await fetch(`https://pokeapi.co/api/v2/generation/${numero}/`)
    const pokemon = await vastaus.json()

    res.render('sukupolvi', { path: req.path, pokemon: pokemon.pokemon_species})
})

app.get('/pokemon/:pokemon', async (req, res) => {
    const fetchPokemon = req.params.pokemon

    const vastaus = await fetch(`https://pokeapi.co/api/v2/pokemon/${fetchPokemon}/`)
    const pokemon = await vastaus.json()

    res.render('pokemon', { path: req.path, pokemon: pokemon})
})

app.get('/error', async (req, res) => {
    res.render('error')
})

app.post('/search', async (req, res) => {
    const search = req.body.body.toLowerCase()

    try {
        const vastaus = await fetch(`https://pokeapi.co/api/v2/pokemon/${search}/`)
        const pokemon = await vastaus.json()

        res.render('pokemon', { path: req.path, pokemon: pokemon})
    } catch {
        res.render('error')
    }
})

app.listen(port, host, () => console.log(`Server is running at http://${host}:${port}/`))