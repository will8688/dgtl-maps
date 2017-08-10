;(function( $, window, document, undefined ){

"use strict";

// your standard jquery code goes here with $ prefix

// best used inside a page with inline code, 

// or outside the document ready, enter code here

 

var google_map = null;

var geocoder = null;

var trafficLayer = null;

var current_location_marker = null;

var my_timezone = "";

var address_bar_height = 0;

 

geocoder = new google.maps.Geocoder();

trafficLayer = new google.maps.TrafficLayer();

$(document).bind("ajaxSend", function(){

$("#my_loading").show();
 }).bind("ajaxComplete", function(){
   $("#my_loading").hide();
 });
   

var executeFunctionByName = function(functionName)
{
    var args = Array.prototype.slice.call(arguments).splice(1);
    var namespaces = functionName.split(".");
    var func = namespaces.pop();
    var ns = namespaces.join('.');
    if(ns == '')
    {
        ns = 'window';
    }
    ns = eval(ns);
    return ns[func].apply(ns, args);
}

function my_location() {
	get_current_location( 'set_location' );
}

function get_location(event, obj_map) {
	if (event.keyCode != 13)

	var address = $("#input_search_address").val();
	geocoder.geocode({
		'address' : address

	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {

			if (current_location_marker)

				current_location_marker.setMap(null);

			

			current_location_marker = new google.maps.Marker({

				icon : plugins_url+'images/location-marker.png',

				map : obj_map,

				position : results[0].geometry.location,

			});

			// To add the marker to the map, call setMap();

			current_location_marker.setMap(google_map);

			google_map.setCenter(results[0].geometry.location);

		} else 
		{

		}

	});

}

function set_location(location) {
	if ( location ) {

		if ( current_location_marker )

			current_location_marker.setPosition(location);

		else {

			current_location_marker = new google.maps.Marker({

				icon : plugins_url+'images/location-marker.png',

				map : google_map,

				position : location,

			});

			current_location_marker.setMap(google_map);

		}

		google_map.setCenter(location);

	}

}


function get_current_location( after_func, Latlng) {

	//alert(after_func);
	geocoder = new google.maps.Geocoder();
	if (Latlng)
	{
		executeFunctionByName(after_func, Latlng);
	}
	else
	{
		if ( navigator.geolocation ) {
		navigator.geolocation.getCurrentPosition(function(position) {

			executeFunctionByName( after_func, new google.maps.LatLng(position.coords.latitude, position.coords.longitude) );
			}, function(msg) {
				executeFunctionByName( after_func, false );
				//return false;
			});

		} else {
			navigator.geolocation.getCurrentPosition(success, error);

			if (google.loader.ClientLocation) {

				executeFunctionByName( after_func, new google.maps.LatLng(google.loader.ClientLocation.latitude, google.loader.ClientLocation.longitude) );

			}

		executeFunctionByName( after_func, false );

		}

	}

	

}

var LocsD = [ {

	lat : 45.4654,

	lon : 9.1866,

	title : 'Milan, Italy',

	html : '&lt;h3&gt;Milan, Italy&lt;/h3&gt;'

}, {

	lat : 47.36854,

	lon : 8.53910,

	title : 'Zurich, Switzerland',

	html : '&lt;h3&gt;Zurich, Switzerland&lt;/h3&gt;',

	visible : false

}, {

	lat : 48.892,

	lon : 2.359,

	title : 'Paris, France',

	html : '&lt;h3&gt;Paris, France&lt;/h3&gt;',

	stopover : true

}, {

	lat : 48.13654,

	lon : 11.57706,

	title : 'Munich, Germany',

	html : '&lt;h3&gt;Munich, Germany&lt;/h3&gt;'

} ];



function fn(obj, type) {

	/*

	 * type:1 => delivery 2 => driver

	 */

	$(obj).hide();

	$(obj).parent().find('.left-arrow').show();

	var len = $(obj).parent().find('input').val().length;

	$(obj).parent().find('input').attr('readonly', false).focus().selectRange(

			len, len);

}





$.fn.selectRange = function(start, end) {

	return this.each(function() {

		if (this.setSelectionRange) {

			this.focus();

			this.setSelectionRange(start, end);

		} else if (this.createTextRange) {

			var range = this.createTextRange();

			range.collapse(true);

			range.moveEnd('character', end);

			range.moveStart('character', start);

			range.select();

		}

	});

};



function getParameterByName(name) {

    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");

    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),

        results = regex.exec(location.search);

    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));

}

	var dgtl_map = {
	map_show_type: "show_all",
	map_markers : [],
	load_markers: [],
	directionsServiceActual : null,
	directionsDisplayActual : null,
	directionsServicePlan : null,
	directionsDisplayPlan : null,
	polylineOptionsActual : {

		strokeColor : '#EFA726',

		strokeOpacity : 1.0,

		strokeWeight : 6

	},
	polylineOptionsPlan : {

		//strokeColor : '#3ace00',

		strokeColor : '#0072e5',

		strokeOpacity : 1.0,

		strokeWeight : 6

	},

	auto_refresh_google_map_timer : null,

	initialize_map : function () {

		// create map definition

		var mapDiv = document.getElementById('map_canvas');

		

		google_map = new google.maps.Map(mapDiv, {

			center : new google.maps.LatLng(52.406822, -1.519693),

			zoom : 4,

			minZoom : 2,

			mapTypeId : google.maps.MapTypeId.ROADMAP,

			style: google.maps.ZoomControlStyle.SMALL,

    		position: google.maps.ControlPosition.RIGHT

		});

		dgtl_map.directionsServiceActual = new google.maps.DirectionsService();

		dgtl_map.directionsServicePlan = new google.maps.DirectionsService();

		

		dgtl_map.directionsDisplayPlan = new google.maps.DirectionsRenderer({

			suppressMarkers : true,

			 draggable: true

			//polylineOptions : dgtl_map.polylineOptionsPlan

		});

		

		dgtl_map.directionsDisplayActual = new google.maps.DirectionsRenderer({

			suppressMarkers : true,

			 draggable: true

			//polylineOptions : dgtl_map.polylineOptionsActual

		});

		

		// Close infowindow when click on map

		google.maps.event.addListener(google_map, 'click', function() {

			// infowindow.close();

			dgtl_map.map_show_type = "show_all";

			//$(".pin_info").hide();

			$('.openclose').toggleClass('close');

			dgtl_map.hiddenLoad();

			

			

			//get_current_location( init_set_map );

			

		});

		

		get_current_location( 'dgtl_map.init_set_map' );

	},

	toggle_traffic : function ()

	{

		

		$('#btn_Traffic').toggleClass('Off On');

		if(trafficLayer.getMap()==null){
			trafficLayer.setMap(google_map); 	

		}

		else{

			trafficLayer.setMap(null); 

		}
	
	},

	init_set_map : function ( location ) {

		

		dgtl_map.hiddenLoad();

		

		//set_location( location );

		var lookuppin

		if(getParameterByName('packageid'))

		{

			lookuppin = getParameterByName('packageid');

		}

		else if(getParameterByName('driverid'))

		{

			lookuppin = getParameterByName('driverid');

		}

		

		$.ajax({

			url: ajax_url,

			type: 'POST',

			data: {

				action: 'get_google_map',

				timezone: my_timezone,

				show: show,

				categories: categories,

				current_lat: location ? location.lat() : 0,

				current_lng: location ? location.lng() : 0,

			},

			

			success:function(data) {

				dgtl_map.map_show_type = "show_all";
				
				//prompt("", "timezone=" + my_timezone + "&current_lat=" + location.lat() + "&current_lng=" + location.lng() )

				for ( var i = 0; i < dgtl_map.map_markers.length; i++) {

					dgtl_map.map_markers[i].marker.setMap(null);

				}

				dgtl_map.map_markers = [];
				var result = $.parseJSON(data);
				//console.log ($.parseJSON(data));
				for ( i = 0; i < result.length; i ++ ) 

				{
						var latLng;
						if(result[i].lat == 0 || result[i].lng == 0) {
							latLng = 0;
						}
						else {
							latLng = new google.maps.LatLng(result[i].lat, result[i].lng);

						}
							
										    
						dgtl_map.createMarker(latLng, google_map,result[i].id, result[i].place_id, result[i].pin_type, result[i].address, result[i].categories, result[i].title);
				}

				

				if (lookuppin >0)

				{

					for ( var j = 0; j <dgtl_map. map_markers.length; j ++ ) 

					{

				 		if(dgtl_map.map_markers[j].id == lookuppin)

				 		{

				 			google_map.setZoom(17);

				 			latLng = new google.maps.LatLng(

				 				dgtl_map.map_markers[j].marker.position.lat(), 

				 				dgtl_map.map_markers[j].marker.position.lng());

							google_map.panTo(latLng);

							google.maps.event.trigger(dgtl_map.map_markers[j].marker, 'click');

							 

				 		}

			 		}

				}

			 	

			 	else {

			 		dgtl_map.resetBounds();

			 	}

				

				dgtl_map.auto_refresh_google_map();

				

			}

		});

	},

	show_current_position : function (current_position) {

		 var myLatLng = new google.maps.LatLng(current_position.lat, current_position.lng);

		 //google_map.setCenter(myLatLng);

		 google_map.panTo(myLatLng);

		 google_map.setZoom(6);		

	},
	share_my_location : function ( location ) {

		$.ajax({

			url: ajax_url,

			type: 'POST',

			data: {

				action: 'share_my_location',

				current_lat: location ? location.lat() : 0,

				current_lng: location ? location.lng() : 0,

			},

			success:function(data) {

				

			}

		});

	},
	hiddenLoad : function () {

		if ( current_location_marker ) {

			current_location_marker.setMap(null);

			current_location_marker = null;

		}

		

		for ( var i = 0; i < dgtl_map.load_markers.length; i++) {

			dgtl_map.load_markers[i].setMap(null);

		}

		dgtl_map.load_markers = [];

		

		if ( dgtl_map.directionsDisplayPlan != null )

			dgtl_map.directionsDisplayPlan.setMap(null);

		

		if ( dgtl_map.directionsDisplayActual != null )

			dgtl_map.directionsDisplayActual.setMap(null);

		

		//dgtl_map.resetBounds();

	},
	resetBounds : function() {

		if ( dgtl_map.map_markers.length == 0 ) return;

		

		var bounds = new google.maps.LatLngBounds(); 



		for (var i = 0; i < dgtl_map.map_markers.length; i++) {

			// Extend the LatLngBound object

			bounds.extend(dgtl_map.map_markers[i].marker.position);

		}

		

		google_map.fitBounds(bounds);

	},
	createMarker : function (latLng, map,id, placeId, pin_type, address,categories, title) {
		var marker, image;
		
		var request = {
		    placeId: placeId
		  };
		  var service = new google.maps.places.PlacesService(map); 
		  	if(pin_type == 'holiday') 
			{
				image = {
			    path: 'M0-165c-27.618 0-50 21.966-50 49.054C-50-88.849 0 0 0 0s50-88.849 50-115.946C50-143.034 27.605-165 0-165z',
			    fillColor: '#337ab7',
			    fillOpacity: 1,
			    rotation: 0,
			    scale: 0.3,
			    strokeWeight: 0
			  	};
			}	
			else if(pin_type == 'lived') 
			{
				image = {
				    path: 'M0-165c-27.618 0-50 21.966-50 49.054C-50-88.849 0 0 0 0s50-88.849 50-115.946C50-143.034 27.605-165 0-165z',
				    fillColor: '#7887AB',
				    fillOpacity: 1,
				    rotation: 0,
				    scale: 0.3,
				    strokeWeight: 0
				  };
			}
		
		  service.getDetails(request, function (place, status) 
		  {
		  	if (status == google.maps.places.PlacesServiceStatus.OK && latLng==0 ) 
		    {
		  	 	latLng = place.geometry.location;	
		  		console.log('Fail: ' + latLng + address);  	 
		  	}
		  	
		  	if (latLng!==0) {
			  		marker = new google.maps.Marker
				      ({
							position : latLng,
							map : map,
							icon : image,
							title : title + ' ' + address,
							animation: google.maps.Animation.DROP,
							category: categories
						});
				
			    if (status == google.maps.places.PlacesServiceStatus.OK) 
			    {
			     	
						 
					  google.maps.event.addListener(marker,'click',function(e) 
						{
							var photos = place.photos;
							var reviews = place.reviews;
							var formatted_address = place.formatted_address;
							var rating = place.rating;
						
							var infoContent;
							
							 infoContent += '<section id="googlereviews" class="color-primary-1">';
								infoContent += '<div class="row">';
								 infoContent = '<h3>' + title + ' - ' + place.name + '</h3><br/>';
								infoContent += '<div class="col-md-6 "><div class="icon color-secondary-0"><i class="fa fa-star"></i>';
							 
							 if (rating) 
							 {
							 	infoContent += '<h4>Google Rating: ' +place.rating + '"</h4><br/>';				
							 }
							 if (reviews) 
							 {
							 infoContent += '<h4>Google Reviews</h4>';
							   for (var r = 0; r < reviews.length; r++) { 
								    infoContent += '<h5>' +place.reviews[r].author_name + '"</h5><p>' +place.reviews[r].text + '"</p><br/>';
								}
							 }
							 infoContent += '</div></div>';
							 infoContent += '<div class="clearfix visible-xs-block"></div>';
							 if (photos) 
							 {
							 	infoContent += '<div class="col-md-6 "><div class="icon color-secondary-0" style="text-align:center;">';
								infoContent += '<i class="fa fa-photo"></i><h3>Google Photos</h3>';
								for (var i = 0; i < photos.length; i++) { 
								    infoContent += '<img style="width:300px; text-align:center; margin: auto 0;" src="' +place.photos[i].getUrl({'maxWidth': 300, 'maxHeight': 300}) + '"/>';
								}
								infoContent += '</div></div>';

							   
							 }
							infoContent += '</div>';
							infoContent += '</section>';
							 
							  
							dgtl_map.showInfo(id,infoContent,pin_type, marker);	
						});					
						dgtl_map.map_markers.push(
								{
									id		: id,
									flag	: pin_type,
									marker	: marker	
								}
						);	  
			    }	
		  	}
		  	else {
		  		console.log(address, status);
		  	}

		  	
		    
		  });
		  
		return marker; 
  
	},
	showInfo : function (id,infoContent,pin_type, marker) {
		//dgtl_map.hiddenLoad();
		if ($(".pin_info").hide())
		{
			$(".pin_info").show()
		}
		$(".pin_info").html(infoContent);
	},
	auto_refresh_google_map : function () {

		if ( dgtl_map.auto_refresh_google_map_timer != null ) {

			clearTimeout(dgtl_map.auto_refresh_google_map_timer);

		}

		dgtl_map.auto_refresh_google_map_timer = setTimeout(function() {

			//get_current_location( 'dgtl_map.reset_map' );

			

		}, 300000);

		

		

	},
	from_position : false,
	last_position : false,
	to_position	  : false,
	showLoad : function (delivery_id, marker, map_pin_type) {

		

		

		dgtl_map.hiddenLoad();

		

		//dgtl_map.map.panTo(marker.position);

		

		dgtl_map.from_position = false;

		dgtl_map.last_position = false;

		dgtl_map.to_position = false;

		

		

		$.ajax({

			url: ajax_url,

			type: 'POST',

			data: {

				action		: 'get_delivery_driving_road',

				delivery_id	: delivery_id,

				timezone	: my_timezone

			},

			success:function(data) {

				dgtl_map.last_position = marker.position;

				

				dgtl_map.map_show_type = "show_load";

				

				var result = $.parseJSON(data);

				var load_from = result.from;

				var load_to = result.to;

				var load_roads = result.roads;

				

				var load_marker, latLng;

				

				var load_request = {};

				

				if ( load_from ) {

					ico = plugins_url + 'images/map_icon1.png';

					image = new google.maps.MarkerImage(ico, new google.maps.Size(37, 37), new google.maps.Point(0, 0), new google.maps.Point(13, 27));

					dgtl_map.from_position = new google.maps.LatLng(load_from.lat, load_from.lng);

					load_marker = new google.maps.Marker({

						position : dgtl_map.from_position,

						map : google_map,

						icon : image,

						shadow : null,

						title : load_from.address

					});

					dgtl_map.load_markers.push(load_marker);

					

					var waypts = [];

					for ( var i = 0; i < load_roads - 1; i ++ ) {

						latLng = new google.maps.LatLng(load_roads[i].lat, load_roads[i].lng);

						waypts.push({

							location : latLng,

							stopover : true

						});

						/*

						load_marker = new google.maps.Marker({

							position : latLng,

							map : map,

							icon : new google.maps.MarkerImage(plugins_url + 'images/map_icon44.png', new google.maps.Size(41, 59), new google.maps.Point(0, 0), new google.maps.Point(27, 62)),

							shadow : null,

							title : load_roads[i].address

						});

						

						load_markers.push(load_marker);*/

					}

					

					load_request = {

						origin : dgtl_map.from_position,

						destination : dgtl_map.last_position,

						waypoints : waypts,

						optimizeWaypoints : false,

						travelMode : google.maps.DirectionsTravelMode.DRIVING

					};

					

					dgtl_map.directionsDisplayActual.setMap(google_map);

					dgtl_map.directionsServiceActual.route(load_request, function(response, status) {

						if (status == google.maps.DirectionsStatus.OK) {

							dgtl_map.directionsDisplayActual.setDirections(response);

						}

					});

				}

				

				dgtl_map.to_position = new google.maps.LatLng(load_to.lat, load_to.lng);

				load_marker = new google.maps.Marker({

					position : dgtl_map.to_position,

					map : google_map,

					icon : new google.maps.MarkerImage(plugins_url + 'images/map_icon2.png', new google.maps.Size(37, 37), new google.maps.Point(0, 0), new google.maps.Point(13, 27)),

					shadow : null,

					title : load_to.address

				});

				dgtl_map.load_markers.push(load_marker);

				

				load_request = {

					origin : dgtl_map.last_position,

					destination : dgtl_map.to_position,

					waypoints : null,

					optimizeWaypoints : false,

					travelMode : google.maps.DirectionsTravelMode.DRIVING

				};

				

				dgtl_map.directionsDisplayPlan.setMap(google_map);

				dgtl_map.directionsServicePlan.route(load_request, function(response, status) {

					if (status == google.maps.DirectionsStatus.OK) {

						dgtl_map.directionsDisplayPlan.setDirections(response);

					}

				});

				

				

					if ( map_pin_type == 1){

						action = 'get_delivery_driver_inbox';

					}

					else {

						action ='get_delivery_package_inbox';

						}

				

				$.post(ajax_url, {

					action		: action,

					delivery_id	: delivery_id,

					timezone	: my_timezone

				}).done(function(infoContent) {

					

					//prompt("",ajax_url + "?action="+action+"&delivery_id="+delivery_id+"&timezone="+my_timezone+"&map_pin_type="+map_pin_type);

								

					$(".openclose").show();

					$(".pin_info").html(infoContent);

					if ($(".pin_info").hide())

					{

						slideToggle();

					}

					

					google_map.panTo(marker.position);

				}).fail(function( jqxhr, textStatus, error ) {

					

				});

			}

		});

	},

	filter : function (category) {

		for ( var j = 0; j <dgtl_map.map_markers.length; j ++ ) 

		{

			 

			 categories = dgtl_map.map_markers[j].marker.category;

			 //console.log(dgtl_map.map_markers[j].marker.category);

			 for ( var i = 0; i <categories.length; i ++ ) {

			 	

			 	if(categories[i] == category)

			 		{

			 			

			 			if (dgtl_map.map_markers[j].marker.getVisible()) {

			 				dgtl_map.map_markers[j].marker.setVisible(false);

			 				

			 			}

			 			else {

			 				dgtl_map.map_markers[j].marker.setVisible(true);

			 			}

						 

			 		}

			 }

			 		

 		}

			

			

	},

	
	journey_from_position : false,
	journey_last_position : false,
	journey_to_position	  : false,
	//var load_roads = result.roads;
	showJourney : function (marker, map_pin_type,journey_id) {

		

		

		

		dgtl_map.hiddenLoad();

		//alert(journey_id);

		//dgtl_map.map.panTo(marker.position);

		

		dgtl_map.journey_from_position = false;

		dgtl_map.journey_last_position = false;

		dgtl_map.journey_to_position = false;

		

		

		$.ajax({

			url: ajax_url,

			type: 'POST',

			data: {

				action		: 'get_journey_driving_road',

				journey_id	: journey_id,

				timezone	: my_timezone

			},

			success:function(data) {

				

				dgtl_map.journey_last_position = marker.position;

				

				dgtl_map.map_show_type = "show_journey";

				

				var result = $.parseJSON(data);

				//console.log(data);

				var load_from = result.from;

				var load_to = result.to;

				var load_roads = result.roads;

				

				var load_marker, latLng;

				

				var load_request = {};

				

				dgtl_map.journey_to_position = new google.maps.LatLng(load_to.lat, load_to.lng);

				dgtl_map.journey_from_position = new google.maps.LatLng(load_from.lat, load_from.lng);

				

				var ico = plugins_url + 'images/map_icon1.png';

				var ico2 = plugins_url + 'images/map_icon2.png';

				var image = new google.maps.MarkerImage(ico, new google.maps.Size(37, 37), new google.maps.Point(0, 0), new google.maps.Point(13, 27));

				var image2 =new google.maps.MarkerImage(ico2, new google.maps.Size(37, 37), new google.maps.Point(0, 0), new google.maps.Point(13, 27));

						

				load_marker = new google.maps.Marker({

						position : dgtl_map.journey_from_position,

						map : google_map,

						icon : image,

						shadow : null,

						title : load_from.address

					});

					//alert(load_marker);

				dgtl_map.load_markers.push(load_marker);

				

				

				load_marker2 = new google.maps.Marker({

					position : dgtl_map.journey_to_position,

					map : google_map,

					icon : image2,

					shadow : null,

					title : load_to.address

				});

				dgtl_map.load_markers.push(load_marker2);

				

				load_request = {

					origin : dgtl_map.journey_from_position,

					destination : dgtl_map.journey_to_position,

					//waypoints : null,

					optimizeWaypoints : false,

					travelMode : google.maps.DirectionsTravelMode.DRIVING

				};

				

				dgtl_map.directionsDisplayPlan.setMap(google_map);

				dgtl_map.directionsServicePlan.route(load_request, function(response, status) {

					if (status == google.maps.DirectionsStatus.OK) {

						dgtl_map.directionsDisplayPlan.setDirections(response);

					}

				});

				

				

				

			}

		});

	},

}
google.maps.event.addDomListener(window, 'load', dgtl_map.initialize_map);

$(document).on({

			  change: function() {

				  var catgory = $( this ).attr("data");

				  dgtl_map.filter(catgory);

			  }

			}, "[id^='yh-filter']");



})( jQuery, window , document );