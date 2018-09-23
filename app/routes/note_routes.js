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
            res.statusCode = 500;
            res.send({ 'error': 'An error has occurred' });
          } else {
            console.log(result)
            const responseString = {
              "id": result.ops[0]._id,
              "distance": result.ops[0].distance,
              "status": result.ops[0].status
            }
            res.statusCode = 200;
            res.send(responseString);
          }
        });
      }).catch((error) => {
        console.log(error)
        res.statusCode = 500;
        res.send({ 'error': 'An error has occurred' })

      });


  });

  app.put('/takeorder/:id', (req, res) => {
    const id = req.params.id;
    const status = req.body.status;
    if (status != "taken") {
      res.statusCode = 500;
      res.send({ 'error': 'Status is invalid' })
      return
    }
    //console.log(id)
    const details = { '_id': new ObjectID(id), 'status': 'UNASSIGN' };
    const updateSuccess = db.collection('notes').findAndModify(
      details, // query
      [['_id', 'asc']],  // sort order
      { $set: { status: "taken" } }, // replacement, replaces only the field "hi"
      {w:1}, // options
      function (err, object) {
        if (err) {
          res.send({ 'error': 'An error occured while taking order.' })
          return;
        }
        else {
          if(object.lastErrorObject.updatedExisting == true)
          {
            res.statusCode = 200;
            res.send({"status": "SUCCESS"})
          }
          else
          {
            res.statusCode = 409;
            res.send({"error": "ORDER_ALREADY_BEEN_TAKEN"})
          }
          //console.log(object)
        }
      });


  });


};
