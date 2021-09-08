const handleImage = (req, res, db) => {
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
}

export default handleImage;