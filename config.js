var mongoskin = require('mongoskin');
var config = {
  //site settings
  name: 'nblog',
  version: '0.0.1',
  postNum: process.env.POST_NUM || '5',//每页显示文章个数
  session_secret: process.env.SESSION_SECRET || 'a743894a0e',//session加密串
  cookie_secret: process.env.COOKIE_SECRET || 'a743894a0e',//session加密串
  auth_cookie_name: process.env.AUTH_COOKIE_NAME || 'nd_secret',//cookie 名字
  spam_cookie_name: process.env.SPAM_COOKIE_NAME || 'nd_spam',//防spam cookie的名字
  port: process.env.PORT || 3000,//端口号
  theme: process.env.THEME || 'mozilla'//主题名称
};
config.akismet_options = {
  apikey: 'c28ea9690585', // akismet api key，不启用 akismet 请设置为空
  // 公用 API Key
  blog: config.url || '/' // required: your root level url
};
// Feed Config
config.rss = {
  max_rss_items: '5',
  title: 'nblog',
  description: 'A simple, lightweight blog inspired by noderce.',
  link: process.env.RSS_LINK || 'http://nomospace.github.io/',
  language: 'zh-cn',
  managingEditor: 'jinlu_hz@163.com (nomospace)',
  webMaster: 'jinlu_hz@163.com (nomospace)',
  generator: 'nblog',
  author: {
    name: 'nomospace',
    uri: 'http://nomospace.github.io/'
  },
  thanksTo: {
    name: 'willerce',
    uri: 'http://willerce.com'
  }
};
exports.config = config;
//mongodb settings for mongolab START
//如果使用 MongoLab 提供的 MongoDB 服务，请保留这个配置，否则，删除下面这一行
exports.db = mongoskin.db(process.env.MONGOLAB_URI || 'mongodb://localhost/nblog');//数据库连接串
//mongodb settings for mongolab END
//mongodb settings for appfog mongodb service START
//如果使用 Appfog 自带的 MongoDB服务，请使用以下配置
/*if (process.env.VCAP_SERVICES) {
 var env = JSON.parse(process.env.VCAP_SERVICES);
 var mongo = env['mongodb-1.8'][0]['credentials'];
 }
 else {
 var mongo = {
 'hostname': 'localhost',
 'port': 27017,
 'username': '',
 'password': '',
 'name': '',
 'db': 'nblog'
 }
 }
 var generate_mongo_url = function (obj) {
 obj.hostname = (obj.hostname || 'localhost');
 obj.port = (obj.port || 27017);
 obj.db = (obj.db || 'test');
 if (obj.username && obj.password) {
 return 'mongodb://' + obj.username + ':' + obj.password + '@' + obj.hostname + ':' + obj.port + '/' + obj.db;
 } else {
 return 'mongodb://' + obj.hostname + ':' + obj.port + '/' + obj.db;
 }
 };
 exports.db = mongoskin.db(generate_mongo_url(mongo));*/
//mongodb settings for appfog mongodb service END