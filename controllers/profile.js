const handleProfile = (db) => (req, res) => {
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
}

export default handleProfile;