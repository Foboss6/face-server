import express from 'express';
import bcrypt from 'bcryptjs';
import cors from 'cors';

const app = express();

const database = {
  users: [
    {
      id: Date.now(),
      name: 'Ivan',
      email: 'ivan@gmail.com',
      password: '$2a$10$E9oXC9EvdJFaag7YS7pJRe6gZesdNk/hwZeVdi3d.tyWQzYxqhFjG',
      entries: 0,
      joined: new Date()
    },
    {
      id: Date.now(),
      name: 'Yana',
      email: 'yana@gmail.com',
      password: '$2a$10$nmZjOyoudnDXHCMott57tOanE9kG61jo7xWTaEQhehksH6s6hboKW',
      entries: 0,
      joined: new Date()
    },
    {
      id: Date.now(),
      name: '11',
      email: '11@i.ua',
      password: '$2a$10$JJzFbngluFiMkp4uN7Wku.a/i3hJ14GH4GaPHfKveuOCj5xnIwPpi',
      entries: 0,
      joined: new Date()
    },
  ]
}

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
  res.json(database.users);
});

// SIGNIN --> POST => signin/fail
app.post('/signin', (req, res) => {
  let found = false;
  for(const el of database.users) {
    if(req.body.email.toLowerCase() === el.email 
      && bcrypt.compareSync(req.body.password, el.password)) {
        res.json(el);
        found = true;
        break;
      }
  }
  if(!found) res.status(400).json(`Error signin`);
});

// REGISTER --> POST => success
app.post('/register', (req, res) => {
  const { name, email, password} = req.body;
  let user = {};

  // generating hash for new user's password
  genSalt(password)
    .then((result) => {
      return genHash(result.salt, result.password);
    })
    .then((result) => {
      // store new user's data in local database
      user = {
        id: Date.now(),
        name: name,
        email: email.toLowerCase(),
        password: result.hash,
        entries: 0,
        joined: new Date()
      }
      database.users.push(user);
    })
      // send respond with answer to front-end
    .then(() => res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      entries: user.entries,
      joined: user.joined,
    }))
    .catch((err) => {
      console.log(err);
    });  
});

// PROFILE --> GET => user id
// maybe we'll use it in future
app.put('/profile/:id', (req, res) => {
  const { id } = req.params;
  let found = false;
  database.users.forEach(user => {
    if(user.id === id) {
      found = true;
      return res.status(200).json(user);
    };
  });
  if(!found) res.status(404).json('No such user');
});

// IMAGE --> PUT => entries
app.put('/image', (req, res) => {
  const { id } = req.body;
  let found = false;
  database.users.forEach(user => {
    if(user.id === id) {
      found = true;
      user.entries++;
      return res.status(200).json(user.entries);
    };
  });
  if(!found) res.status(404).json('No such user');
})

app.listen(3001, ()=>{console.log('server is runnig')});