var db = require('../config.js').db;
db.bind('page');
exports.all = function(callback) {
  db.page.find().sort({created: -1}).toArray(function(err, result) {
    callback(err, result)
  });
};
exports.get = function(condition, callback) {
  db.page.findOne(condition, function(err, result) {
    callback(err, result);
  });
};
exports.insert = function(obj, callback) {
  db.page.insert(obj, function(err, result) {
    callback(err, result);
  });
};
exports.update = function(id, page, callback) {
  db.page.update({id: id}, {$set: page }, function(err, result) {
    callback(err, result);
  })
};
exports.deleteById = function(id, callback) {
  db.page.remove({id: id}, function(err, result) {
    callback(err, result);
  });
};