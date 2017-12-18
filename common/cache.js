var redis = require('./redis');


exports.get = function (key) {
	return new Promise(async function(resolve,reject) {
		let value = await redis.get(key);
		if(value) {
			value = JSON.parse(value)
		}
		resolve(value)
	});
}


exports.set = function (key, value, time) {
	if(value) value = JSON.stringify(value)
	return redis.set(key, value,time);
}
