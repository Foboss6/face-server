import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import knex from 'knex';

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

// ******* BCRYPT section ******************************
// generate a random salt
const genSalt = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(10, function(err, salt) {
      if (err) {
        reject(err);
      } else {
        resolve({
          salt: salt,
          password: password
        });
      }
    });
  });
}

// generate hash for the password
const genHash = (salt, password) => {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, salt, function(err, hash) {
      if (err) {
        reject(err);
      } else {
        resolve({
          salt: salt,
          password: password,
          hash: hash
        });
      }
    });
  });
}
// *******************************************************

// ROOT
app.get('/', (req, res) => {
  db.select('*').from('users')
  .then((users => res.status(200).json(users)))
  .catch(err => res.status(400).json('Error in getting data from database'));
});

// SIGNIN --> POST => signin/fail
app.post('/signin', (req, res) => {
  db.select('email', 'hash')
  .from('login')
  .where('email', '=', req.body.email.toLowerCase())
  .then((data) => {
    if(bcrypt.compareSync(req.body.password, data[0].hash)) {
      return db.select('*')
      .from('users')
      .where('email', '=', data[0].email)
      .then(user => res.status(200).json(user[0]))
      .catch(err => res.status(400).json('Error in database'));
    } else res.status(404).json('No such user');
  })
  .catch(err => res.status(400).json('Invalid email'));
});

// REGISTER --> POST => success
app.post('/register', (req, res) => {
  const { name, email, password} = req.body;

  // generating hash for new user's password
  genSalt(password)
  .then((result) => {
    return genHash(result.salt, result.password);
  })
  .then((result) => {
    // store new user's password into database
    db('login').insert({
      hash: result.hash,
      email: email.toLowerCase(),
    }).catch(err => res.status(400).json(err));
  })
  .then(() => {
    // store new user's data into database
    db('users')
    .returning('*')
    .insert({
      name: name,
      email: email.toLowerCase(),
      joined: new Date()
    })
    // send respond with answer to front-end
    .then((user) => res.status(200).json(user[0]))
    .catch(err => res.status(400).json(err));
  })
  .catch(err => res.status(400).json(err));
      
});

// PROFILE --> GET => user id
// maybe we'll use it in future
app.put('/profile/:id', (req, res) => {
  const { id } = req.params;

  db.select('*').from('users').where({id: id})
  .then(data => {
    if(data.length) {
      res.status(200).json(data[0]);
    } else {
      res.status(404).json('Not found such user');
    }
  })
  .catch(err => res.status(400).json('Error in getting data from database'));
});

// IMAGE --> PUT => entries
app.put('/image', (req, res) => {
  const { id } = req.body;

  db('users').where({id})
  .increment('entries', 1)
  .returning('entries')
  .then(data => {
    if(data.length) {
      res.status(200).json(data[0]);
    } else {
      res.status(404).json('Not found such user');
    }
  })
  .catch(err => res.status(400).json('Error in getting data from database'));
})

app.listen(3001, ()=>{console.log('server is runnig')});