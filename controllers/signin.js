const handleSignin = (req, res, db, bcrypt) => {
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
}

export default handleSignin;