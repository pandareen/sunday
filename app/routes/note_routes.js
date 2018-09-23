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
      .then(getDirection, response => {
        
        getDirection(response.body, req.body.origin.map(Number), req.body.destination.map(Number));
        //  console.log(directions)
      }).catch((error) => {
        res.send({ 'error': 'An error has occurred' })
        done();
      });
    //console.log(directions)
    const note = { asdas: 123 }

  });

  function getDirection(directions, orgCoord, destCoord) {
    console.log(directions)
    const note = {
      
    }
    db.collection('notes').insert(note, (err, result) => {
      if (err) {
        res.send({ 'error': 'An error has occurred' });
      } else {
        res.send(result.ops[0]);
      }
    });
  }

};
