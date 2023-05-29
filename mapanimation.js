var map;
var markers = [];
var routeToTrack = 1;
var reCenter = true;

// load map
function init(){
	var myOptions = {
		zoom      : 20,
		center    : { lat:42.353350,lng:-71.091525},
		mapTypeId : google.maps.MapTypeId.ROADMAP
	};
	var element = document.getElementById('map');
  	map = new google.maps.Map(element, myOptions);
  	addMarkers();
    showRoutes();
}

// Add bus markers to map
async function addMarkers(){
	// get bus data
	var locations = await getBusLocations();
    if (locations.length == 0) {
     alert("Currently there is no bus on this Route:" + routeToTrack);
     return;
    }

	// loop through data, add bus markers
	locations.forEach(function(bus){
		var marker = getMarker(bus.id);		
		if (marker){
			moveMarker(marker,bus);
		}
		else{
			addMarker(bus);			
		}
	});

	// timer
	console.log(new Date());
	setTimeout(addMarkers,15000);
}

// Request bus data from MBTA
async function getBusLocations(){
	// var url = 'https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=86&include=trip';	
	var url = 'https://api-v3.mbta.com/vehicles?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[route]=' + 
         routeToTrack + '&include=trip';	
    console.log(url);	
    var response = await fetch(url);
	var json     = await response.json();
	return json.data;
}

async function showRoutes() {
    var routes = await getRouteInfo();
    var routesDropDown = document.getElementById('routeDropDown');

    routes.forEach((route)=>{
        let option = document.createElement("option");
        option.setAttribute('value', route.id);
        if (route.id == 1) {
            option.selected = true;
        }
        let optionText = document.createTextNode(route.id + ':' + route.attributes.long_name);
        option.appendChild(optionText);
        routesDropDown.appendChild(option);
    });

}

function trackNewRoute() {
   var routeSelected = document.getElementById('routeDropDown');
   
   console.log(routeSelected.options[routeSelected.selectedIndex].value);
   routeToTrack = routeSelected.options[routeSelected.selectedIndex].value;

   // delete markers for old route
   markers.forEach((marker)=>{
    marker.setMap(null);
   });

   markers = [];
   reCenter = true;
   addMarkers();
};

// Request route data from MBTA
async function getRouteInfo(){
	var url = 'https://api-v3.mbta.com/routes?api_key=ca34f7b7ac8a445287cab52fb451030a&filter[type]=3&sort=long_name';	
	var response = await fetch(url);
	var json     = await response.json();
	return json.data;
}

function addMarker(bus){
	var icon = getIcon(bus);
	var marker = new google.maps.Marker({
	    position: {
	    	lat: bus.attributes.latitude, 
	    	lng: bus.attributes.longitude
	    },
	    map: map,
	    icon: icon,
	    id: bus.id,
        title: bus.id
	});
    if (reCenter) {
        map.panTo(marker.getPosition());
        reCenter = false;
    }
	markers.push(marker);
}

function getIcon(bus){
	// select icon based on bus direction
	if (bus.attributes.direction_id === 0) {
		return 'red.png';
	}
	return 'blue.png';	
}

function moveMarker(marker,bus) {
	// change icon if bus has changed direction
	var icon = getIcon(bus);
	marker.setIcon(icon);

	// move icon to new lat/lon
    marker.setPosition( {
    	lat: bus.attributes.latitude, 
    	lng: bus.attributes.longitude
	});
}

function getMarker(id){
	var marker = markers.find(function(item){
		return item.id === id;
	});
	return marker;
}

window.onload = init;
