var AV = require('leanengine');
var _ = require('underscore')._;
var debug = require('debug')('common:redis');
var redis = require('redis');
var Promise = require('bluebird');
var config = require('../config')

// 使用 bluebird 为 node-redis 添加 Promise 接口
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
var redisClient;
if(config.redis) {

  redisClient = redis.createClient(config.redis);

  redisClient.on('error', function(err) {
    return console.error('redis err: %s', err);
  });

}
var classname = 'cache';
var adClass = AV.Object.extend(classname);

exports.get = function(key){
	debug('redis get');
    if(redisClient) {
        return redisClient.getAsync(key);
    } else {
        let query = new AV.Query(classname);
        query.equalTo('key', key);
        return query.first().then(function (item) {
            if(item) {
                let expire = item.get('expire');
                if(expire && expire < new Date() ) {
                    item.destroy();
                    return null;
                }
                return item.get('value')
            } else {
                return null;
            }
        })
    }
}

exports.set = function(key, value, time){
	 debug('redis set');
    if(redisClient) {
        console.log(time);
        if(time) {
            return redisClient.setAsync(key, value, 'EX', time);
        } else {
            return redisClient.setAsync(key, value);
        }
    } else {
        let query = new AV.Query(classname);
        query.equalTo('key', key);
        return query.first().then(function (item) {
            if(!item) {
               item = new adClass();
               item.set('key', key);
            }
            item.set('value', value);
            if(time) {
                let expireDate = moment().add(time, 'seconds').toDate();
                item.set('expire', expireDate);
            }
            return item.save();
        })
    }

}
