var xbique 			= require('./xbique');
		// xbiqueAnti 	= require('./xbiqueAnti');





var init= () => {
	try {
		xbique.spiders();
		// xbiqueAnti.spiders();
	} catch(err) {
		console.log('init err='+err);
	}
}
init();
