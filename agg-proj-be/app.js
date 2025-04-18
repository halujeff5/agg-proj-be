const express = require('express');
const bcrypt = require('bcrypt');
const axios = require('axios')
const app = express();
const jwt = require('jsonwebtoken')
const channelhash = require('./channelIds');
const cors = require('cors');
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require('./config');
require('dotenv').config()
app.use(express.json());
// import { gql, GraphQLClient } from 'graffle'
const { Client } = require('podcast-api');
const userRoutes = require('./routes/users');
app.use('/users', userRoutes)
const pgp = require('pg-promise')
const pool = require('./db.js');

const podcastsAPIKey = process.env.PODCASTAPIKEY

console.log('BCRYPT WORK FACTOR', BCRYPT_WORK_FACTOR)

const handleCors = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Content-Type", 'application/json');
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
};
app.use(handleCors)

const channelIds = {
    'CNBC Television':  'UCrp_UI8XtuYfpiqluWLD7Lw',
    'Bloomberg Podcasts': 'UChF5O40UBqAc82I7-i5ig6A',
    'Bloomberg Television' : 'UCIALMKvObZNtJ6AmdCLP7Lg',
    'ABC News': 'UCBi2mrWuNuyYy4gbM6fU18Q',
    'BBC News': 'UC16niRr50-MSBwiO3YDb3RA',
    'NBC News' : 'UC16niRr50-MSBwiO3YDb3RA',
    'Al Jazeera' : 'UCNye-wNBqNL5ZzHSJj3l8Bg',
    'MSNBC' : 'UCaXkIU1QidjPwiAYu6GcHjg',
    'CBS News' : 'UC8p1vwvWtl6T73JiExfWs1g',
    'USA Today' : 'UCP6HGa63sBC7-KHtkme-p-g',
    'Sky News' : 'UCoMdktPbSTixAyNGwb-UYkQ ',
    'Fox News' : 'UCXIJgqnII2ZOINSWNOGFThA',
    'WION' : 'UC_gUM8rL-Lrg6O3adPW9K1g'
}

const apiKey = process.env.YOUTUBEAPIKEY

app.get('/', async (req, res, next) => {
    console.log('Im HERE 3')
    res.json('Im here man')
    next()
})

app.get('/youtube', async (req, res, next) => {
    console.log('IM HERE')
    let term = req.query
    console.log('TERM', term.term)

 
    for (const [key, value] of Object.entries(channelIds)) {
       
        if (key == term.term) {
            console.log(value)
            try {
                const resp = await axios.request(`https://www.googleapis.com/youtube/v3/search?key=${apiKey}&part=snippet&type=video&channelId=${value}&maxResults=20&order=date`)
                let ans = resp.data.items
                console.log(ans)
                return res.json(resp.data.items)
            } catch (e) {
                console.log(e)
            }
        }
    }next()
});

app.post('/register', async (req, res, next) => {
    const { firstname, lastname, username, password, email } = req.query;
    console.log(req.query)

    const hashedPwd = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    const secretKey = process.env.SECRET_KEY

    const payload = {
        user : username
    }

    const jwtToken = jwt.sign(payload, secretKey)

    try {
        const result = await pool.query(`
        INSERT INTO users (firstname, lastname, username, password, email) VALUES ($1, $2, $3, $4, $5) RETURNING *`, [firstname, lastname, username, hashedPwd, email ]);

        // await bcrypt.compare(password, hashedPwd)
        const user = result.rows[0].username;
        let ans = res.status(201).json({ user, jwtToken })
        console.log('SUCCESS', ans)
        return ans
    } catch (e) {
        console.log(e)
        next(e)
    }
});

app.post('/vault', async (req, res, next) => {

    const { username, title, url, description, author, image, published_at } = req.body;
    console.log(req.body)

    try {
        const result = await pool.query(`INSERT INTO vault (username, title, url, description, author, image, published_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`, [username, title, url, description, author, image, published_at]);
        res.json(result.rows);
        console.log(res)
    }catch(e) {
        console.log(e)
    }
}
)

app.get('/vault', async (req, res, next) => {

    let username = req.query
    console.log(username)

    try {
        const result = await pool.query(`SELECT * FROM VAULT WHERE USERNAME = $1`, [username] );
        console.log(result.rows)

        return res.status(200).json(result.rows)
    } catch(e) {
        console.log(e)
    }
}
)

app.get('/podcasts', async (req, res, next) => {
    
    const term = req.query
    console.log('TERM', term.term)

    const client = Client({apiKey: podcastsAPIKey});

    client.search({
        q: term.term,
        language : 'English',
        only_in: 'title, description',
        page_size: 15,
        type: 'episode'
    }).then((resp) => {
        console.log(resp.data.results);
        return res.status(200).json(resp.data.results)
    }). catch((e) => {
        console.log(e)
    })

})

app.get('/login', async (req, res, next) => {
    try {
        const { username, password } = req.query;
        console.log(req.query)

        const results = await pool.query(
            `SELECT username, password FROM users WHERE username = $1`, [username]);

        const user = results.rows[0].username;
        const pwd = results.rows[0].password;
        const secretKey = process.env.SECRET_KEY

        const payload = {
            user : user
        }

        const jwtToken = jwt.sign(payload, secretKey)

        if (user && pwd) {
            if (await bcrypt.compare(password, pwd)) {
                let result = res.status(201).json({ user, jwtToken })
                console.log('SUCCESS', result)
                return result
            }
            else {
                let ans = res.status(401).json({ error: 'Username and/or password do not match' })
                return ans
            }
        }

        if (!username || !password) {
            let ans = res.status(401).json({ error: 'Please add username or password' })
        }
    }
    catch (e) {
        return res.status(400).json({ error: 'Username and/or password do not match' })

    }
}
)





app.get('youtube-channels', async (req, res, next) => {

})


module.exports = app;