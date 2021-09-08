import bcrypt from 'bcryptjs';

const handleRegister = (req, res, db) => {
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

}

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

export default handleRegister;