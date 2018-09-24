var ObjectID = require('mongodb').ObjectID;
var mongoose = require('mongoose')
const db = require('../../config/db');
mongoose.connect(db.url, (err, database) => {
});
var Order = require('../../models/order')

const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const directionsClient = mbxDirections({ accessToken: 'pk.eyJ1Ijoic2FuZGVzaHlhcHVyYW0iLCJhIjoiY2ptZGw2bXFxNjJxazNxbGkxNmFzNWxlaSJ9.Xr1eZTKMDJnlayXvr20Q8w' });

module.exports = function (app, db) {

  app.post('/order1', (req, res) => {
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


  app.post('/order', function (req, res, next) {
    var order = new Order()
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
        order.distance = JSON.parse(response.rawBody).routes[0].distance;
        order.originCoord = req.body.origin.map(Number);
        order.destCoord = req.body.destination.map(Number);
        order.status = "UNASSIGN";
        order.save(function (err, result) {
          if (err) {
            res.statusCode = 500;
            res.send({ 'error': 'An error has occurred' });
            return
          }
          const responseString = {
            "id": result._id,
            "distance": result.distance,
            "status": result.status
          }
          res.statusCode = 200;
          res.send(responseString);
          return;
        });
      }).catch((error) => {
        res.statusCode = 500;
        res.send({ 'error': 'An error has occurred' })
        return
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
      { w: 1 }, // options
      function (err, object) {
        if (err) {
          res.send({ 'error': 'An error occured while taking order.' })
          return;
        }
        else {
          if (object.lastErrorObject.updatedExisting == true) {
            res.statusCode = 200;
            res.send({ "status": "SUCCESS" })
          }
          else {
            res.statusCode = 409;
            res.send({ "error": "ORDER_ALREADY_BEEN_TAKEN" })
          }
          //console.log(object)   
        }
      });
  });


  app.get('/orders', function (req, res, next) {
    var perPage = Number(req.query.limit) || 10;
    var page = Number(req.query.page) || 1;
    Order
      .find({})
      .skip((perPage * page) - perPage)
      .limit(perPage)
      .exec(function (err, orders) {
        if (err) {
          res.send(err);
        }
        var resObjs = [];
        orders.forEach(function (value) {
          resObjs.push({
            "id": value._id,
            "distance": value.distance,
            "status": value.status
          })
        });
        res.send(resObjs)
        return;
      })
  });


};
