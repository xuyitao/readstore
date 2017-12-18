var xbique 				= require('./xbique');
		xbiqueArti 	= require('./xbiqueArti');





var init= () => {
	try {
		xbique.spiders();
		xbiqueArti.spiders();
	} catch(err) {
		console.log('init err='+err.stack);
	}
}
init();
