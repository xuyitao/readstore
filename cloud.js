var AV            = require('leanengine'),
    xbique 				= require('./task/xbique'),
    xbiqueArti 	= require('./task/xbiqueArti');

/**
 * 一个简单的云代码方法
 */
AV.Cloud.define('xbieque', function(request) {
  xbique.spiderDef();
  return 'Hello world!';
});


AV.Cloud.define('xbiqueArti', function(request) {
  xbiqueArti.spiderDef();
  return 'Hello world!';
});
