function loadMap() {
	var options = {
		draggable: false,
		panControl: false,
		streetViewControl: false,
		scrollwheel: false,
		scaleControl: false,
		disableDefaultUI: true,
		disableDoubleClickZoom: true,
		zoom: 3,		
		center: new google.maps.LatLng(15.45, 18.732),		
		styles: [{"featureType":"administrative","stylers":[{"visibility":"off"}]},{"featureType":"poi","stylers":[{"visibility":"simplified"}]},{"featureType":"road","elementType":"labels","stylers":[{"visibility":"simplified"}]},{"featureType":"water","stylers":[{"visibility":"simplified"}]},{"featureType":"transit","stylers":[{"visibility":"simplified"}]},{"featureType":"landscape","stylers":[{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"visibility":"off"}]},{"featureType":"road.local","stylers":[{"visibility":"on"}]},{"featureType":"road.highway","elementType":"geometry","stylers":[{"visibility":"on"}]},{"featureType":"water","stylers":[{"color":"#84afa3"},{"lightness":52}]},{"stylers":[{"saturation":-17},{"gamma":0.36}]},{"featureType":"transit.line","elementType":"geometry","stylers":[{"color":"#3f518c"}]}]
	};
	mapObject = new google.maps.Map(document.getElementById('mapCanvas'), options);
}

var planeSymbol	= {
	path: 'M22.1,15.1c0,0-1.4-1.3-3-3l0-1.9c0-0.2-0.2-0.4-0.4-0.4l-0.5,0c-0.2,0-0.4,0.2-0.4,0.4l0,0.7c-0.5-0.5-1.1-1.1-1.6-1.6l0-1.5c0-0.2-0.2-0.4-0.4-0.4l-0.4,0c-0.2,0-0.4,0.2-0.4,0.4l0,0.3c-1-0.9-1.8-1.7-2-1.9c-0.3-0.2-0.5-0.3-0.6-0.4l-0.3-3.8c0-0.2-0.3-0.9-1.1-0.9c-0.8,0-1.1,0.8-1.1,0.9L9.7,6.1C9.5,6.2,9.4,6.3,9.2,6.4c-0.3,0.2-1,0.9-2,1.9l0-0.3c0-0.2-0.2-0.4-0.4-0.4l-0.4,0C6.2,7.5,6,7.7,6,7.9l0,1.5c-0.5,0.5-1.1,1-1.6,1.6l0-0.7c0-0.2-0.2-0.4-0.4-0.4l-0.5,0c-0.2,0-0.4,0.2-0.4,0.4l0,1.9c-1.7,1.6-3,3-3,3c0,0.1,0,1.2,0,1.2s0.2,0.4,0.5,0.4s4.6-4.4,7.8-4.7c0.7,0,1.1-0.1,1.4,0l0.3,5.8l-2.5,2.2c0,0-0.2,1.1,0,1.1c0.2,0.1,0.6,0,0.7-0.2c0.1-0.2,0.6-0.2,1.4-0.4c0.2,0,0.4-0.1,0.5-0.2c0.1,0.2,0.2,0.4,0.7,0.4c0.5,0,0.6-0.2,0.7-0.4c0.1,0.1,0.3,0.1,0.5,0.2c0.8,0.2,1.3,0.2,1.4,0.4c0.1,0.2,0.6,0.3,0.7,0.2c0.2-0.1,0-1.1,0-1.1l-2.5-2.2l0.3-5.7c0.3-0.3,0.7-0.1,1.6-0.1c3.3,0.3,7.6,4.7,7.8,4.7c0.3,0,0.5-0.4,0.5-0.4S22,15.3,22.1,15.1z',
	fillColor: '#2299DD',
	fillOpacity: 1.5,
	scale: 0.8,	
	anchor: new google.maps.Point(11, 11),
	strokeWeight: 0
};

function animate(oPlan) {
	// Convert the points into google latlng objects
	var sP = new google.maps.LatLng(oPlan.startPoint[0],oPlan.startPoint[1]);
	var eP = new google.maps.LatLng(oPlan.endPoint[0],oPlan.endPoint[1]);

	// Polyline for the planes path
	oPlan.planePath = new google.maps.Polyline({
		path: [sP, eP],
		strokeColor: '#0f0',
		strokeWeight: 0,
		icons: [{
			icon: planeSymbol,
			offset: '0%'
		}],
		map: mapObject,
		geodesic: true
	});

	oPlan.trailPath = new google.maps.Polyline({
		path: [sP, sP],
		strokeColor: '#2299DD',
		strokeWeight: 2,
		map: mapObject,
		geodesic: true
	});

	oPlan.googleStartPoint = sP;
	oPlan.googleEndPoint = eP;

	// Execute the animation plan
	oPlan.animLoop = window.requestAnimationFrame(function(){		
		execute(oPlan);		
	});
}

function execute(oPlan) {	
	oPlan.animIndex+=0.25; 

	// Draw trail
	var nextPoint =	google.maps.geometry.spherical.interpolate(oPlan.googleStartPoint,oPlan.googleEndPoint,oPlan.animIndex/100);
	oPlan.trailPath.setPath([oPlan.googleStartPoint, nextPoint]);

	// Plane movement
	oPlan.planePath.icons[0].offset=Math.min(oPlan.animIndex,100)+'%';		
	oPlan.planePath.setPath(oPlan.planePath.getPath());

	// If the plan is not finished, keep executing it.
	if(oPlan.animIndex<100) {
		oPlan.animLoop = window.requestAnimationFrame(function(){
			execute(oPlan);
		});
	}
	else{
		// Decrement the active number of animations to signal
		// the wait loop to start spinning up more animations.
		activeAnimations--;
	}
}

// This animation wait function prevents executing the animations
// for all 240+ countries all at once. 
// To bypass this, update the maximumAnimations var to 300. 
function wait()
{
	setTimeout(() => 
	{
		if (activeAnimations < maximumAnimations)
		{
			setTimeout(() => {
				animateNext();
			}, 100);
			
		}
		else
		{
			setTimeout(() => {
				wait();
			}, 100);
		}
	}, 100);
}

// Function called to execute one new animation
function animateNext()
{	
	var oPlan = {};
	oPlan.index = i;	
	oPlan.startPoint = [-33.918861, 18.423300];
	oPlan.endPoint = countries[i].latlng;	
	oPlan.animLoop = false;
	oPlan.animIndex = 0;
	oPlan.planePath = false;
	oPlan.trailPath = false;
	animPlans.push(oPlan);
	animate(oPlan);

	activeAnimations++;

	i++;
	if (i >= total) return;
	
	wait();	
}

/* Configuration */
var maximumAnimations = 10;

/* Global Variables */
var animPlans = [];
var total = countries.length;
var i = 0;
var activeAnimations = 0;

/* Start Methods */
loadMap();
animateNext();

// Alternative, animate all planes at the same time with no delay.
// for (var i=0; i<countries.length; i++)
// {			
// 	var oPlan = {};
// 	oPlan.index = i;	
// 	oPlan.startPoint = [-33.918861, 18.423300];
// 	oPlan.endPoint = countries[i].latlng;	
// 	oPlan.animLoop = false;
// 	oPlan.animIndex = 0;
// 	oPlan.planePath = false;
// 	oPlan.trailPath = false;
// 	animPlans.push(oPlan);
// 	animate(oPlan);
// }