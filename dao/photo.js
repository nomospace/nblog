var db = require('../config.js').db;
db.bind('photo');
exports.all = function(condition, limit, callback) {
  db.photo.find(condition).limit(limit).sort({created: -1, _id: -1}).toArray(function(err, result) {
    callback(err, result);
  });
};
exports.insert = function(obj, callback) {
  db.photo.insert(obj, function(err, result) {
    callback(err, result);
  });
};
exports.findByPhotoId = function(photo_id, callback) {
  db.photo.findOne({photo_id: photo_id}, function(err, result) {
    callback(err, result);
  });
};
exports.findOne = function(id, callback) {
  db.photo.findOne({_id: db.ObjectID.createFromHexString(id)}, function(err, result) {
    callback(err, result);
  });
};
exports.save = function(obj, callback) {
  db.photo.save(obj, function(err, result) {
    callback(err, result);
  });
};
exports.deleteById = function(photo_id, callback) {
  db.photo.remove({photo_id: photo_id}, function(err, result) {
    callback(err, result);
  });
};
exports.updateByPhotoId = function(photo_id, photo, callback) {
  db.photo.update({photo_id: photo_id}, {$set: photo}, function(err, result) {
    callback(err, result);
  });
};