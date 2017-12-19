'use strict'
var AV 			= require('leanengine'),
		_ 			= require('underscore')._,
		moment 	= require('moment'),
		common 	= require('./common'),
		util 		= require('../common/util'),
		cache		= require('../common/cache'),
		iconv 	= require('iconv-lite'),
		debug 	= require('debug')('spider/xbiqueArti'),
		getMeta = require("lets-get-meta"),
		cheerio = require('cheerio');

var itemHead = 'xhead';
var headClass = AV.Object.extend(itemHead);
var itemCon = 'xcontent';
var conClass = AV.Object.extend(itemCon);

module.exports.spiders = async () => {
	debug('xbiequeArti runtask');

	while(true) {
		try {
			let query = new AV.Query(itemHead);
			query.equalTo('isupdate', 1);
			query.ascending('updatedAt');
			let item = await query.first()
			if(item) {
				let res = await getChapterPage(item.toJSON())
				// return cache.set(key, index);
				if(res && item) {
					if(!item) {
						item = new headClass()
					}
					item.set('isupdate', 0);
					await itemObj.save();
				}
			}

		}catch(err) {
			console.log('xbiequeArti spiders  err='+err.stack);
		}
	}
}

var isGo = false;
module.exports.spiderDef = async () => {
	debug('xbiequeArti runtask isGo='+isGo);
	if(isGo) return ;

	isGo = true;
	try {
		let query = new AV.Query(itemHead);
		query.equalTo('isupdate', 1);
		query.ascending('updatedAt');
		let item = await query.first()
		if(item) {
			let res = await getChapterPage(item.toJSON())
			// return cache.set(key, index);
			if(res && item) {
				if(!item) {
					item = new headClass()
				}
				item.set('isupdate', 0);
				await itemObj.save();
			}
		}

	}catch(err) {
		console.log('xbiequeArti spiders  err='+err.stack);
	}
	isGo = false;
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

var delRepeItem = (items, arrs) => {
	if(items.length == 0) {
		return arrs;
	}
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
}

var getChapterPage = async (head) => {
	debug('getChapterPage head.headUrl='+head.headUrl);
	let body = await common.requestUrl(head.headUrl, true);
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


	let query =new AV.Query(itemCon);
	query.equalTo('headid', AV.Object.createWithoutData(itemHead, head.objectId));
	query.ascending('updatedAt');
	let items = await query.find();
	arrs = delRepeItem(items, arrs)
	for(let i=0; i<arrs.length; i++) {
		let item = arrs[i];
		let content = await getContentPage(item.href);
		var itemObj = new conClass();

		itemObj.set('rank', item.rank);
		itemObj.set('href', item.href);
		itemObj.set('chapter', item.chapter);
		itemObj.set('content', content);
		itemObj.set('headid', AV.Object.createWithoutData(itemHead, head.objectId));
		await itemObj.save();

	}
}

var getContentPage = (url) => {

	debug('getContentPage url='+url);
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
