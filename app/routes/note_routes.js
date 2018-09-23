var ObjectID = require('mongodb').ObjectID;

const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const directionsClient = mbxDirections({ accessToken: 'pk.eyJ1Ijoic2FuZGVzaHlhcHVyYW0iLCJhIjoiY2ptZGw2bXFxNjJxazNxbGkxNmFzNWxlaSJ9.Xr1eZTKMDJnlayXvr20Q8w' });

module.exports = function (app, db) {

  app.post('/order', (req, res) => {

    directionsClient
      .getDirections({
        waypoints: [
          {
            coordinates: req.body.origin.map(Number)
          },
          {
            coordinates: req.body.destination.map(Number)
          }
        ]
      })
      .send()
      .then(response => {
        const distance = JSON.parse(response.rawBody).routes[0].distance;
        const originCoord = req.body.origin.map(Number);
        const destCoord = req.body.destination.map(Number);
        const note = { "distance": distance, "originCoord": originCoord, "destCoord": destCoord, "status": "UNASSIGN" }
        db.collection('notes').insert(note, (err, result) => {
          if (err) {
            res.send({ 'error': 'An error has occurred' });
          } else {
            console.log(result)
            const responseString = {
              "id": result.ops[0]._id,
              "distance": result.ops[0].distance,
              "status": result.ops[0].status
            }
            res.send(responseString);
          }
        });
      }).catch((error) => {
        console.log(error)
        res.send({ 'error': 'An error has occurred' })

      });


  });
};
