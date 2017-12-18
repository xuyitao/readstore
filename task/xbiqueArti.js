'use strict'
var _ = require('underscore')._,
	request = require('request'),
	async = require('async'),
	zlib = require('zlib'),
	moment = require('moment'),
	common = require('./common'),
	ExSql = require('../mysql/ExSql'),
  util = require('../utils'),
  tkrequest = require('../service/tkrequest'),
	cache= require('../service/cache'),
	log = require('log4js').getLogger('spider/xbieque'),
	iconv = require('iconv-lite'),
	getMeta = require("lets-get-meta"),
	cheerio = require('cheerio');

var itemHead = 'xhead';
var itemCon = 'xcontent';

module.exports.spiders = function () {
	log.info('xbiequeArti runtask');
	return new Promise(function(resolve,reject) {

		async.whilst(
			function() {
				return true;
			},
			function(cb) {
				let query = new ExSql.Query(itemHead);
				// query.equalTo('status', 0);
				query.equalTo('isupdate', 1);
				query.ascending('updatedAt');
				query.first().then(function (item) {
					if(item) {
						return getChapterPage(item).then(function (res) {
							// return cache.set(key, index);
							if(res && item) {
								let itemObj = new ExSql.SqlObject(itemHead);
								itemObj.setJson(item);
								itemObj.set('isupdate', 0);
								return itemObj.save();
							}
						})
					}

				}).then(function () {
					cb(null);
				}).catch(function (err) {
					log.info('xbiequeArti  spiders err='+err.stack);
					setTimeout(function () {
						cb(null);
					}, 5000);
				})
			},
			function(err) {
				log.info(err);

				resolve(null);
			}
		);
	});
}
function spiderTest() {
	// for(let i = 1; i<30; i++) {
	getChapterPage({url:"http://www.biqiuge.com/book/2/", id:1});
	// getContentPage('http://www.biqiuge.com/book/2/210.html');
		// getCatsDetail(2);
	// 	console.log(i);
	// }

}
// spiderTest()

function getChapterPage(head) {

	log.info('getChapterPage head.headUrl='+head.headUrl);
	return new Promise(function(resolve,reject) {
		common.requestUrl(head.headUrl, true).then(function (body) {
			let str = iconv.decode(body, 'gbk');
			let arrs=[];
			// console.log(str);
			let metas = getMeta(str);
			const $ = cheerio.load(str);

			$('#list dl dd').children().each(function(i, elem) {
				// console.log($(elem).text());
				// console.log($(elem).attr('href'));
				let chapter = $(elem).text();
				arrs.push({
					rank:i,
					href:`${head.headUrl}${$(elem).attr('href')}`,
					chapter:$(elem).text().trim()
				})
			})
			return arrs;
		}).then(function (arrs) {
			let query = new ExSql.Query(itemCon);
			query.equalTo('headid', head.id);
			query.ascending('updatedAt');
			return query.find().then(function (items) {
				if(items.length == 0) return arrs;

				let resArrs=[];
				for(let num=0; num<arrs.length; num++) {
					let oriItem = arrs[num];
					let i=0;
					let isFinded = false;

					for(i=0; i<items.length; i++) {
						let item = items[i];
						if(item.href == oriItem.href) {
							isFinded = true
							break;
						}
					}
					if(isFinded) {
						items.splice(i, 1);
					} else {
						resArrs.push(oriItem)
					}
				}
				return resArrs;
			});

		}).then(function (arrs) {

			async.eachOfSeries(arrs, function (item, i, callback) {
				getContentPage(item.href).then(function (content) {
					var itemObj = new ExSql.SqlObject(itemCon);

					itemObj.set('rank', item.rank);
					itemObj.set('href', item.href);
					itemObj.set('chapter', item.chapter);
					itemObj.set('content', content);
					itemObj.set('headid', head.id);
					return itemObj.save();

				}).then(function () {
					setTimeout(function () {
						callback(null)
					}, 300);
				}).catch(function (err) {
					callback(err)
				});

			}, function (err, result) {
				log.info("getChapterPage runtask finish err="+err);
				if(err) {
					reject(err)
				} else {
					resolve(true)
				}
			});
		}).catch(function (err) {
			log.info('getChapterPage err='+err);
			reject(err)
		})
	})
}

function getContentPage(url) {

	log.info('getContentPage url='+url);
	return new Promise(function(resolve,reject) {

		common.requestUrl(url, true).then(function (body) {
			let str = iconv.decode(body, 'gbk');
			let arrs=[];
			// console.log(str);
			const $ = cheerio.load(str);

			let content = $('#content').text();
			let res = content.match(/笔趣阁.*最新章节！/);
			content = content.replace(res, '');
			resolve(content)
		}).catch(reject)

	})
}


function checkAntiSpider(jsonObj){
    if (jsonObj['rgv587_flag0'] != undefined){
        return true;
    }
    else{
        return false;
    }
}
