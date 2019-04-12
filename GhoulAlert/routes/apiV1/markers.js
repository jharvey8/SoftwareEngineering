var passport = require('passport');
var router = require('express').Router();
var auth = require('../authorize');
var models  = require('../../models');
const Sequelize = require('sequelize');

var User = models.User;
var Marker = models.Marker;

//Get all markers
router.get('/', auth.optional, (req, res, next) => {
  return Marker.findAll({
    attributes: ['id', 'latitude', 'longitude', 'name', 'description', 'UserId']
  }).then((markers) => {
    return res.json(markers);
  });
});

//Get all markers with basic user information included
router.get('/withusers', auth.optional, (req, res, next) => {
  return Marker.findAll({
    attributes: ['id', 'latitude', 'longitude', 'name', 'description'],
    include: [{ model: User, attributes: ['id', 'username'] }]
  }).then((markers) => {
    return res.json(markers);
  });
});

//Get a specific marker
router.get('/:mid', auth.optional, (req, res, next) => {
  var marker_id = req.params.mid;

  return Marker.findOne({ where: { id: marker_id } }).then((marker) => {
    if (!marker) {
      return res.status(404).json({
        errors: {
          marker: "not found"
        }
      });
    }

    return res.json(marker.toJSON());
  });
});

//Get a specific marker with basic user information
router.get('/:mid/withuser', auth.optional, (req, res, next) => {
  var marker_id = req.params.mid;

  return Marker.findOne({
    where: { id: marker_id },
    attributes: ['id', 'latitude', 'longitude', 'name', 'description'],
    include: [{ model: User, attributes: ['id', 'username'] }]
  }).then((marker) => {
    if (!marker) {
      return res.status(404).json({
        errors: {
          marker: "not found"
        }
      });
    }

    return res.json(marker.toJSON());
  });
});

//Post a new marker. User authentication required.
router.post('/', auth.required, (req, res, next) => {
  var username = req.payload.username;
  var marker = req.body;

  if(!marker.latitude) {
    return res.status(422).json({
      errors: {
        latitude: 'is required',
      },
    });
  }

  if(!marker.longitude) {
    return res.status(422).json({
      errors: {
        longitude: 'is required',
      },
    });
  }

  if(!marker.name) {
    return res.status(422).json({
      errors: {
        name: 'is required',
      },
    });
  }

  return User.findOne({ where: { username: username } }).then((user) => {
    if (!user) {
      return res.sendStatus(400).json({
        errors: {
          authentication: 'is invalid'
        }
      });
    }

    var finalMarker = Marker.build(marker);
    finalMarker.setUser(user);

    return finalMarker.save()
      .then(() => {
        res.json({
          success: true,
          marker: finalMarker.toJSON()
        });
      }).catch(Sequelize.ValidationError, function (error) {
        res.json({
          success: false,
          error: { message: error.message }
        });
      });

  });

});

//Edit a marker. Authenticated user must match marker owner.
router.put('/:mid', auth.required, (req, res, next) => {
  var marker_id = req.params.mid;
  var username = req.payload.username;
  var marker_update = req.body;

  return User.findOne({ where: { username: username } }).then((user) => {
    if (!user) {
      return res.sendStatus(400).json({
        errors: {
          authentication: 'is invalid'
        }
      });
    }

    return Marker.findOne({ where: { id: marker_id } }).then((marker) => {
      if (!marker) {
        return res.sendStatus(404).json({
          errors: {
            marker: 'not found'
          }
        });
      }

      marker.getUser().then((owner) => {
        if (owner.id != user_id) {
          return res.sendStatus(403).json({
            errors: {
              user: 'not authorized to modify this marker'
            }
          });
        }
      });

      var preUpdateInfo = marker.toJSON();

      marker.update(marker_update).then(() => {
        return res.json({
          success: true,
          editedFrom: preUpdateInfo,
          editedTo: marker.toJSON()
        });
      }).catch((error) => {
        return res.json({
          success: false,
          marker: preUpdateInfo,
          error: {
            message: error.message
          }
        });
      });

    });

  });
});

//Delete a marker. Authenticated user must match marker owner.
router.delete('/:mid', auth.required, (req, res, next) => {
  var marker_id = req.params.mid;
  var username = req.payload.username;

  return User.findOne({ where: { username: username } }).then((user) => {
    if (!user) {
      return res.sendStatus(400).json({
        errors: {
          authentication: 'is invalid'
        }
      });
    }

    return Marker.findOne({ where: { id: marker_id } }).then((marker) => {
      if (!marker) {
        return res.sendStatus(404).json({
          errors: {
            marker: 'not found'
          }
        });
      }

      marker.getUser().then((owner) => {
        if (owner.id != user.id) {
          return res.sendStatus(403);
        }
      });

      var destroyedInfo = marker.toJSON();

      marker.destroy().then(() => {
        return res.json({
          success: true,
          deleted: destroyedInfo
        });
      }).catch((error) => {
        return res.json({
          success: false,
          error: {
            message: error.message
          }
        });
      });

    });

  });
});

//GET all of a user's markers
router.get('/from/:uid', auth.optional, (req, res, next) => {
  var uid = req.params.uid;

  return User.findOne({ where: { id: uid } }).then((user) =>{
    if(!user) {
      return res.sendStatus(404);
    }

    user.getMarkers().then((markers) => {
      var markersJSON = markers.map(marker => marker.toJSON());
      return res.json(markersJSON);
    });

  });
});


module.exports = router;
