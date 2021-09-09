import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import knex from 'knex';

import handleRegister from './controllers/register.js';
import handleSignin from './controllers/signin.js';
import handleProfile from './controllers/profile.js';
import handleImage from './controllers/image.js';

const PORT = process.env.PORT;
// To set PORT on Windows write next command in CMD:
// [Environment]::SetEnvironmentVariable("PORT", "1235")
// where 1235 is the numb of your port
// To see a list all environment variables make
// Get-ChildItem Env:    or     Get-ChildItem Env:PORT

const db = knex({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    port : 5432,
    user : 'postgres',
    password : '123',
    database : 'postgres'
  }
});

const app = express();

// MIDDLEWIRE
app.use(express.json());
app.use(cors());

// SIGNIN --> POST => signin/fail
app.post('/signin', (req, res) => { handleSignin(req, res, db, bcrypt) });

// REGISTER --> POST => success
app.post('/register', (req, res) => { handleRegister(req, res, db) });

// IMAGE --> PUT => entries
app.put('/image', (req, res) => { handleImage(req, res, db) });

// PROFILE --> GET => user id
// maybe we'll use it in future
app.put('/profile/:id',  handleProfile(db));

app.listen(PORT || 3000, ()=>{
  console.log(`server is listening on port: ${PORT}`)
});