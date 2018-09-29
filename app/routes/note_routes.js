var Order = require('../../models/order')
const logger = require('../../config/winston-logger')
const namespace = require('node-request-context').getNamespace('myapp.mynamespace');
console.log(' basboa '+ namespace)
const mbxDirections = require('@mapbox/mapbox-sdk/services/directions');
const directionsClient = mbxDirections({ accessToken: 'pk.eyJ1Ijoic2FuZGVzaHlhcHVyYW0iLCJhIjoiY2ptZGw2bXFxNjJxazNxbGkxNmFzNWxlaSJ9.Xr1eZTKMDJnlayXvr20Q8w' });

module.exports = function (app, mg) {

  app.post('/order', function (req, res, next) {
    logger.info(namespace.get('tid'))
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
            return res.send({ 'error': 'An error has occurred' });
          }
          const responseString = {
            "id": result._id,
            "distance": result.distance,
            "status": result.status
          }
          res.statusCode = 200;
          return res.send(responseString);
        });
      }, error => {
        res.statusCode = 500;
        return res.send({ 'error': 'An error has occurred' })
      });
  });

  app.put('/takeorder/:id', (req, res, next) => {
    const id = req.params.id;
    const status = req.body.status;
    if (status != "taken") {
      res.statusCode = 500;
      return res.send({ 'error': 'Status is invalid' })
    }

    Order.findById(id, (err, order) => {
      if (err) {
        return res.send({ 'error': 'An error occured while taking order.' })
      }

      if (order.status == "UNASSIGN") {
        Order.findByIdAndUpdate(id, { status: "SUCCESS" }, { new: true }, (err, updatedOrder) => {
          if (err) {
            return res.send({ 'error': 'An error occured while taking order.' })
          }
          res.statusCode = 200;
          return res.send({ 'status': updatedOrder.status })
        })
      }
      else {
        res.statusCode = 409;
        return res.send({ "error": "ORDER_ALREADY_BEEN_TAKEN" })
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
          return res.send(err);
        }
        var resObjs = [];
        orders.forEach(function (value) {
          resObjs.push({
            "id": value._id,
            "distance": value.distance,
            "status": value.status
          })
        });
        return res.send(resObjs)
      })
  });


};
