var db = require('../config.js').db;
db.bind('post');
exports.all = function(callback) {
  db.post.find({}, {"content": 0}).sort({created: -1, _id: -1}).toArray(function(err, result) {
    callback(err, result)
  });
};
exports.findAll = function(skip, limit, callback) {
  db.post.find().sort({created: -1, _id: -1}).skip(skip).limit(limit).toArray(function(err, result) {
    callback(err, result)
  });
};
exports.findByTag = function(tag, callback) {
  db.post.find({tags: tag }).sort({created: -1, _id: -1}).toArray(function(err, result) {
    callback(err, result)
  });
};
exports.get = function(condition, callback) {
  db.post.findOne(condition, function(err, result) {
    callback(null, result);
  });
};
exports.insert = function(obj, callback) {
  db.post.insert(obj, function(err, result) {
    callback(err, null);
  });
};
exports.update = function(id, post, callback) {
  db.post.update({id: id}, {$set: post }, function(err, result) {
    callback(err, result);
  })
};
exports.delete = function(slug, callback) {
};
exports.count = function(condition, callback) {
  db.post.count(condition, function(err, count) {
    callback(err, count);
  });
};
exports.deleteById = function(id, callback) {
  db.post.remove({id: id}, function(err, result) {
    callback(err, result);
  });
};