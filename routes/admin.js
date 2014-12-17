var util = require('../libs/util.js');
var config = require('../config.js').config;
var userDao = require('../dao/user.js');
var postDao = require('../dao/post.js');
var pageDao = require('../dao/page.js');
var commentDao = require('../dao/comment.js');
var photoDao = require('../dao/photo.js');
var dateFormat = require('dateformat');
var marked = require('marked');
var akismet = require('akismet').client({blog: config.akismet_options.blog, apiKey: config.akismet_options.apikey/*, debug: true*/});
function _index(req, res) {
  res.render('admin/index', {layout: true});
}
function _postIndex(req, res) {
  postDao.all(function(err, result) {
    if (!err)
      res.render('admin/post_index', {layout: true, post_list: result, title: '日志列表'});
  });
}
function _postWrite(req, res) {
  if (req.method == 'GET') {//render post write view
    res.render('admin/post_write', {layout: true});
  } else if (req.method == 'POST') {// POST a post
    var created = dateFormat(new Date(), "yyyy-mm-dd");
    if (req.body.created)
      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd");
    var post = {
      id: +new Date() + '',
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      content_html: marked(req.body.content),
      created: created,
      tags: req.body.tags.split(',')
    };
    postDao.insert(post, function(err, result) {
      if (!err) {
        res.redirect('/admin/post/edit/' + post.id);
      } else {
        console.log("error");
      }
    });
  }
}
function _postEdit(req, res) {
  if (req.method == "GET") {
    var id = req.params.id;
    postDao.get({'id': id}, function(err, post) {
      if (post != null)
        res.render('admin/post_edit', {layout: true, post: post});
      else
        res.redirect('/admin/post')
    })
  } else if (req.method == "POST") {
    var created = dateFormat(new Date(), "yyyy-mm-dd");
    if (req.body.created)
      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd");
    var post = {
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      content_html: marked(req.body.content),
      created: created,
      tags: req.body.tags.split(',')
    };
    postDao.update(req.body.post_id, post, function(err) {
      if (!err) {
        res.redirect('/admin/post/edit/' + req.body.post_id + "?msg=success");
      }
    });
  }
}
function _postDelete(req, res) {
  if (req.method == "GET") {
    postDao.deleteById(req.params.id, function(err, result) {
      if (!err) {
        res.redirect("/admin/post");
      }
    });
  }
}
function _pageIndex(req, res) {
  pageDao.all(function(err, result) {
    if (!err)
      res.render('admin/page_index', {layout: true, page_list: result});
  });
}
function _pageWrite(req, res) {
  if (req.method == 'GET') {//render post write view
    res.render('admin/page_write', {layout: true});
  } else if (req.method == 'POST') {// POST a post
    var created = dateFormat(new Date(), "yyyy-mm-dd");
    if (req.body.created)
      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd")
    var page = {
      id: +new Date() + '',
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      content_html: marked(req.body.content),
      created: created
    };
    pageDao.insert(page, function(err, result) {
      if (!err) {
        res.redirect('/admin/page/edit/' + page.id);
      } else {
        console.log(err);
      }
    });
  }
}
function _pageEdit(req, res) {
  if (req.method == "GET") {
    var id = req.params.id;
    pageDao.get({id: id}, function(err, page) {
      if (page != null)
        res.render('admin/page_edit', {layout: true, page: page});
      else
        res.redirect('/admin/page')
    })
  } else if (req.method == "POST") {
    var created = dateFormat(new Date(), "yyyy-mm-dd");
    if (req.body.created)
      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd");
    var page = {
      id: req.body.page_id,
      title: req.body.title,
      slug: req.body.slug,
      content: req.body.content,
      content_html: marked(req.body.content),
      created: created
    };
    pageDao.update(req.body.page_id, page, function(err, result) {
      if (!err)
        res.redirect('/admin/page/edit/' + req.body.page_id + "?msg=success");
    });
  }
}
function _pageDelete(req, res) {
  if (req.method == "GET") {
    pageDao.deleteById(req.params.id, function(err, result) {
      if (!err) {
        res.redirect("/admin/page");
      }
    });
  }
}
function _commentIndex(req, res) {
  var limit = 100;
  var status = req.query['status'];
  if (!status) status = '1';
  commentDao.all({status: status}, limit, function(err, comments) {
    postDao.all(function(err, posts) {
      res.render('admin/comment_index', {layout: true, comment_list: comments, posts: posts, status: status});
    });
  });
}
function _commentDelete(req, res) {
  commentDao.deleteById(req.params.id, function(err, result) {
    res.redirect("/admin/comment");
  });
}
function _verifyAkismet(req, res) {
  akismet.verifyKey(function(err, verified) {
    res.render('admin/verify_akismet', {layout: true, status: !!verified});
  });
}
function _submitSpam(req, res) {
  commentDao.findOne(req.params.id, function(err, comment) {
    if (!err) {
      // buggy
      akismet.submitSpam({
        user_ip: comment.ip,
        permalink: config.url + "/post/" + comment.post_slug,
        comment_author: comment.author,
        comment_author_email: comment.email,
        comment_author_url: comment.url,
        comment_type: "comment",
        comment_content: comment.content
      }, function(err) {
        console.log('Spam reported to Akismet.');
        comment.status = "0";//状态： 1：正常，0：SPAM
        commentDao.save(comment, function(err, result) {
          if (!err)
            console.log("save comment status success");
          else
            console.log("save comment status failed");
        });
      });
    }
    res.redirect("/admin/comment");
  });
}
function _photoIndex(req, res) {
  var limit = 999;
  photoDao.all({}, limit, function(err, photos) {
    res.render('admin/photo_index', {layout: true, photos: photos});
  });
}
exports.photoEdit = function(req, res) {
  if (req.method == "GET") {
    var id = req.params.photo_id;
    if (id) {
      photoDao.findByPhotoId(id, function(err, photo) {
        if (photo != null)
          res.render('admin/photo_edit', {layout: true, photo: photo});
        else
          res.redirect('/admin/photo');
      });
    } else {
      res.render('admin/photo_edit', {layout: true});
    }
  } else if (req.method == "POST") {
//    var created = dateFormat(new Date(), "yyyy-mm-dd");
//    if (req.body.created)
//      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd");
    var photo = {
      photo_id: req.body.photo_id,
      title: req.body.title,
      raw_url: req.body.raw_url,
      preview_url: req.body.preview_url,
      description: req.body.description
    };
    photoDao.updateByPhotoId(req.body.photo_id, photo, function(err, result) {
      if (!err)
        res.redirect('/admin/photo');
//        res.redirect('/admin/photo/edit/' + req.body.photo_id + "?msg=success");
    });
  }
}
function _photoWrite(req, res) {
  if (req.method == 'GET') {//render post write view
    res.render('admin/photo_write', {layout: true});
  } else if (req.method == 'POST') {// POST a post
    var created = dateFormat(new Date(), "yyyy-mm-dd");
    if (req.body.created)
      created = dateFormat(new Date(req.body.created), "yyyy-mm-dd")
    var photo = {
      photo_id: +new Date() + '',
      title: req.body.title,
      raw_url: req.body.raw_url,
      preview_url: req.body.preview_url,
      description: req.body.description,
      created: created
    };
    photoDao.insert(photo, function(err, result) {
      if (!err) {
//        res.redirect('/admin/photo/edit/' + photo.photo_id);
        res.redirect('/admin/photo');
      } else {
        console.log(err);
      }
    });
  }
}
function _photoDelete(req, res) {
  if (req.method == "GET") {
    photoDao.deleteById(req.params.id, function(err, result) {
      if (!err) {
        res.redirect("/admin/photo");
      }
    });
  }
}
function _login(req, res) {
  if (req.method == "GET") {
    res.render("admin/login", {layout: true});
  } else if (req.method == "POST") {
    var name = req.body.name.trim();
    var pass = req.body.pass.trim();
    if (name == '' || pass == '') {
      res.render('admin/login', {
        layout: false,
        error: '信息不完整。'
      });
      return;
    }
    //判断用户帐号密码
    userDao.get(name, function(err, user) {
      if (user) {
        pass = util.md5(pass);
        if (user.password != pass) {
          res.render('admin/login', {
            layout: false,
            error: '密码错误。'
          });
          return;
        }
        _genSession(user, res);// store session cookie
        res.redirect('/admin');
      } else {
        res.redirect('/admin/login');
      }
    });
  }
}
function _logout(req, res, next) {
  req.session.destroy();
  res.clearCookie(config.auth_cookie_name, {
    path: '/'
  });
  res.redirect('/');
};
function _authUser(req, res, next) {
  if (req.session.user) {
    return next();
  }
  else {
    var cookie = req.cookies[config.auth_cookie_name];
    if (!cookie)
      return res.redirect('/admin/login');
    var auth_token = util.decrypt(cookie, config.session_secret);
    var auth = auth_token.split('\t');
    var user_name = auth[0];
    userDao.get(user_name, function(err, user) {
      if (user) {
        req.session.user = user;
        return next();
      }
      else {
        return res.redirect('/admin/login');
      }
    });
  }
}
function _install(req, res, next) {
  userDao.findAll({}, function(err, result) {
    if (!err) {
      if (result.length > 0) {
        /** 已经初始化过了 ***/
        if (req.query['msg'] == "success")
          res.render('admin/install', {layout: false, msg: "success"})
        else
          res.render('admin/install', {layout: false, installed: true})
      } else {
        /***未初始化过***/
        if (req.method == "GET") {
          res.render('admin/install', {layout: false});
        } else if (req.method == "POST") {
          //将用户输入的帐密插入到 user 表中
          var user = {
            name: req.body.name,
            password: util.md5(req.body.password)
          };
          //插入一个用户
          userDao.insert(user, function(err, result) {
            if (!err) {
              //发布一个 Hello World! 的文章
              var post = {
                id: +new Date() + '',
                title: "Hello world!",
                slug: "hello-world",
                content: "欢迎使用 nblog。 这是程序自动发布的一篇文章。欢迎 fork nblog : https://github.com/nomospace/nblog",
                created: dateFormat(new Date(), "yyyy-mm-dd")
              };
              postDao.insert(post, function(err, result) {
                if (!err) {
                  //在 Hello world! 下发表一篇评论
                  var comment = {
                    post_id: post._id.toString(),
                    post_slug: post.slug,
                    author: "nomospace",
                    email: "jinlu_hz@163.com",
                    url: "https://github.com/nomospace",
                    content: "欢迎使用 nblog，欢迎与我交流Nodejs相关技术、",
                    created: dateFormat(new Date(), "isoDateTime")
                  };
                  commentDao.insert(comment, function(err, result) {
                    if (!err) res.redirect('/admin/install?msg=success');
                  });
                }
              });
            }
          });
        }
      }
    } else {
      next();
    }
  });
}
/** private function */
function _genSession(user, res) {
  var auth_token = util.encrypt(user.name + '\t' + user.password, config.session_secret);
  res.cookie(config.auth_cookie_name, auth_token, {
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7
  }); // cookie 有效期1周
}
//URL: /admin
exports.index = _index;
// URL: /admin/post
exports.postIndex = _postIndex;
// URL : /admin/post/write
exports.postWrite = _postWrite;
// URL : /admin/post/edit
exports.postEdit = _postEdit;
exports.postDelete = _postDelete;
// URL: /admin/page
exports.pageIndex = _pageIndex;
// URL : /admin/page/write
exports.pageWrite = _pageWrite;
// URL : /admin/page/edit
exports.pageEdit = _pageEdit;
// URL : /admin/page/delete
exports.pageDelete = _pageDelete;
exports.commentIndex = _commentIndex;
exports.commentDelete = _commentDelete;
exports.verifyAkismet = _verifyAkismet;
exports.submitSpam = _submitSpam;
exports.photoIndex = _photoIndex;
exports.photoWrite = _photoWrite;
exports.photoDelete = _photoDelete;
//URL: /admin/login
exports.login = _login;
//URL: /admin/logout
exports.logout = _logout;
// authUser middleware
exports.authUser = _authUser;
// URL:  /install
exports.install = _install;
