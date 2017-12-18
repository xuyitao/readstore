'use strict'
var  	AV 			= require('leanengine'),
			_ 			= require('underscore')._,
			moment 	= require('moment'),
			common 	= require('./common'),
  		util 		= require('../common/util'),
			cache		= require('../common/cache'),
			iconv 	= require('iconv-lite'),
			debug 	= require('debug')('spider/xbique'),
			getMeta = require("lets-get-meta"),
			cheerio = require('cheerio');

var itemName = 'xhead';
var adClass = AV.Object.extend(itemName);

module.exports.spiders = async function () {
	debug('runtask');

	let key = 'curIndex'
	let index=1;

	let value = await cache.get(key);
	if(value) {
		index = +value;
	}
	await cache.set(key, index);

	while(true) {
		debug('xbieque index='+index);
		if(index >= 30000) {
			index = 1;
		}
		try {
			let result = await getHeaderPage(index);
			// console.log('result='+result);

			if(result) {
				index++
				await cache.set(key, index);
			}
			await util.sleep(300);
		} catch(err) {
			debug('xbieque spiders err='+err.stack);
			await util.sleep(5000);
		}

	}


}
function spiderTest() {
	// for(let i = 1; i<30; i++) {
	getHeaderPage(2);
		// getHeaderPage(3, 1);
		// getCatsDetail(2);
	// 	console.log(i);
	// }

}
// spiderTest()

var getHeaderPage = async (index) => {
	let url = `http://www.biqiuge.com/book/${index}/`
	debug('getHeaderPage index='+index);

	let query = new AV.Query(itemName);
	query.equalTo('headUrl', url);
	let item = await query.first();

	if(item && item.status == 1) {
		return true;
	} else {
		try {
			let body = await common.requestUrl(url, true)
			let str = iconv.decode(body, 'gbk');
			let arrs=[];
			// console.log(str);
			let metas = getMeta(str);
			const $ = cheerio.load(str);

			let updateTime=metas['og:novel:update_time']
			let status=metas['og:novel:status']
			if(status == '连载中') {
				status = 0
				let titles = $('#list').text();
				let res = /完结|完本/.test(titles);
				if(res) {
					status = 1
				} else {
					let oneMonthBefore = moment(new Date()).subtract(1,'months').toDate();
					if(oneMonthBefore > new Date(updateTime)) {
						status = 1
					}
				}
			} else {
				status = 1
			}
			let headData = {
				bookname:metas['og:novel:book_name'],
				author:metas['og:novel:author'],
				category:metas['og:novel:category'],
				img:metas['og:image'],
				description:metas['og:description'] || '无',
				headUrl:metas['og:novel:read_url'],
				updateTime:updateTime,
				status:status
			}

			if(!headData.bookname) {
				return true
			}

			if(!headData.category) {
				headData.category = '其他'
			}
			if(item && item.updateTime && headData.updateTime &&
				new Date(item.updateTime).getTime() == new Date(headData.updateTime).getTime()) {
				return true;
			} else {
				if(!item) {
					item = new adClass()
				}

				item.set('bookname', headData.bookname);
				item.set('author', headData.author);
				item.set('category', headData.category);
				item.set('img', headData.img);
				item.set('description', headData.description);
				item.set('headUrl', headData.headUrl);
				item.set('updateTime', new Date(headData.updateTime));
				item.set('status', headData.status);
				item.set('isupdate', 1);
				await item.save();
				return true;
			}
		}catch(err) {
			debug('getHeaderPage='+err);
			return false;
		}
		return true;
	}
}
