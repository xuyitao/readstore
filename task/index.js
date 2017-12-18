var xbique 			= require('./xbique');
		// xbiqueAnti 	= require('./xbiqueAnti');





var init= () => {
	console.log(11111111);
	try {
		xbique.spiders();
		// xbiqueAnti.spiders();
	} catch(err) {
		console.log('init err='+err);
	}
}
console.log(22222222222);
init();
