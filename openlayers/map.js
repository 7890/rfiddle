/*
//tb/160220
//OpenStreetMap boilerplate

Projections
***********
(from http://openstreetmapdata.com/info/projections)
"
OpenStreetMap uses the "WGS84" spatial reference system used by the Global Positioning System (GPS).
It uses geographic coordinates between -180° and 180° longitude and -90° and 90° latitude. 
So this is the "native" OSM format

Most tiled web maps (such as the standard OSM maps and Google Maps) use the Mercator projection.
The map area of such maps is a square with x and y coordiates both between 
-20,037,508.34 and 20,037,508.34 meters. As a result data north of about 
85.1° and south of about -85.1° latitude can not be shown and has been cut off.
"

Built-in EPSG codes known to OpenLayers (at least)
EPSG:4326 (==WGS84), "GPS", uses a coordinate system on the surface of a sphere or ellipsoid of reference.
EPSG:3857 (==EPSG:900913), "Web Mercator", uses a coordinate system PROJECTED from the surface of the sphere or ellipsoid to a flat surface.
*/

//http://dev.openlayers.org/docs/files/OpenLayers/Map-js.html
var map;

//http://dev.openlayers.org/docs/files/OpenLayers/Layer/Markers-js.html
var marker_layer;

//http://dev.openlayers.org/docs/files/OpenLayers/Marker-js.html
var marker_size = new OpenLayers.Size(21,25);
var marker_offset = new OpenLayers.Pixel(-(marker_size.w/2), -marker_size.h);
var marker_icon = new OpenLayers.Icon('img/marker.png', marker_size, marker_offset);
var main_marker=new OpenLayers.Marker(new OpenLayers.LonLat(0,0),marker_icon);

//init called from map.html body onload
function init()
{
	//explicit definition to expand zoom levels (client side zoom)
	var resolutions=[
		156543.03390625, 78271.516953125, 39135.7584765625,
		19567.87923828125, 9783.939619140625, 4891.9698095703125,
		2445.9849047851562, 1222.9924523925781, 611.4962261962891,
		305.74811309814453, 152.87405654907226, 76.43702827453613,
		38.218514137268066, 19.109257068634033, 9.554628534317017,
		4.777314267158508, 2.388657133579254, 1.194328566789627,
		0.5971642833948135, 0.25, 0.1, 0.05
	];

	var serverResolutions=[
		156543.03390625, 78271.516953125, 39135.7584765625,
		19567.87923828125, 9783.939619140625, 4891.9698095703125,
		2445.9849047851562, 1222.9924523925781, 611.4962261962891,
		305.74811309814453, 152.87405654907226, 76.43702827453613,
		38.218514137268066, 19.109257068634033, 9.554628534317017,
		4.777314267158508, 2.388657133579254, 1.194328566789627,
		0.5971642833948135
	];

	map = new OpenLayers.Map(
	{
		div: "map"
		,controls: [] //no default set
		,projection: "EPSG:3857"
		,displayProjection: "EPSG:4326"
		,resolutions: resolutions
		,numZoomLevels: 21
	});

	var standard_baselayer_options=
	{
		resolutions: resolutions
		,serverResolutions: serverResolutions
		,isBaseLayer: true
	};

	var empty_layer = new OpenLayers.Layer.Vector("empty",standard_baselayer_options);

	var osm_layer = new OpenLayers.Layer.OSM(null,null,standard_baselayer_options);

	var mapquest_layer = new OpenLayers.Layer.OSM("mapquest",
	[
		 "http://otile1.mqcdn.com/tiles/1.0.0/map//${z}/${x}/${y}.jpg"
		,"http://otile2.mqcdn.com/tiles/1.0.0/map//${z}/${x}/${y}.jpg"
		,"http://otile3.mqcdn.com/tiles/1.0.0/map//${z}/${x}/${y}.jpg"
		,"http://otile4.mqcdn.com/tiles/1.0.0/map//${z}/${x}/${y}.jpg"
	],standard_baselayer_options);

	var stamen_toner_standard_layer = new OpenLayers.Layer.Stamen("toner",standard_baselayer_options);
	var stamen_toner_lite_layer = new OpenLayers.Layer.Stamen("toner-lite",standard_baselayer_options);
	var stamen_toner_hybrid_layer = new OpenLayers.Layer.Stamen("toner-hybrid",standard_baselayer_options);
	var stamen_toner_lines_layer = new OpenLayers.Layer.Stamen("toner-lines",standard_baselayer_options);
	var stamen_toner_background_layer = new OpenLayers.Layer.Stamen("toner-background",standard_baselayer_options);

	//http://dev.openlayers.org/docs/files/OpenLayers/Layer/Markers-js.html
	marker_layer = new OpenLayers.Layer.Markers("marker");

	//http://dev.openlayers.org/docs/files/OpenLayers/Layer/Vector-js.html

	map.addLayers([
		empty_layer
		,osm_layer
		,mapquest_layer
		,stamen_toner_standard_layer
		,stamen_toner_lite_layer
		,stamen_toner_hybrid_layer
		,stamen_toner_lines_layer
		,stamen_toner_background_layer
		,marker_layer
	]);
	map.addControls([
		new OpenLayers.Control.Navigation(),
		new OpenLayers.Control.Zoom(),
		new OpenLayers.Control.LayerSwitcher(),
		new OpenLayers.Control.Attribution(),
		new OpenLayers.Control.ScaleLine(
		{
			/*
			//http://girona-openlayers-workshop.readthedocs.org/en/latest/controls/scaleline.html
			You can disable top or bottom part of scaleline by setting topOutUnits or bottomOutUnits to empty string:
			map.addControl(new OpenLayers.Control.ScaleLine({bottomOutUnits: ''}));
			That behavior is not mentioned in documentation, but you can find it easily, when you look at control's source code.
			*/
			bottomOutUnits: ''
			,div: OpenLayers.Util.getElement("scaleline-id")
		})
	]);

	//mouse right click context menu
	map.div.oncontextmenu = function onContextMenu(e)
	{
		if(!e){ //dear IE...
			var e = window.event;
			e.returnValue = false;
		}

		if (OpenLayers.Event.isRightClick(e))
		{
			var mouse_pixel_pos=map.events.getMousePosition(e);
			var mouse_mercator_pos=map.getLonLatFromViewPortPx(mouse_pixel_pos);
			var mouse_wgs84_pos=mouse_mercator_pos.clone();
			mouse_wgs84_pos.transform(map.getProjectionObject(),map.displayProjection);
//			console.log("right click: xy: "+mouse_pixel_pos+" mercator "+mouse_mercator_pos+" wgs84 "+mouse_wgs84_pos);
			main_marker=new OpenLayers.Marker(mouse_mercator_pos.clone(),marker_icon);
			marker_layer.addMarker(main_marker);
			main_marker.display(true);
			update_position_panel(mouse_pixel_pos,mouse_mercator_pos,mouse_wgs84_pos);
/*
			var onPopupClose = function (e)
			{
				this.destroy();
			}

			var popup = new OpenLayers.Popup.FramedCloud("click popup"
				,mouse_mercator_pos
				,new OpenLayers.Size(100,100)
				,'<h1>hello</h1>'
				,null,true,onPopupClose);

			map.addPopup(popup, true);
*/
		}
		return false; //prevent display of browser context menu
	}//end noContextMenu()

	goto_home_view();
	map.setBaseLayer(osm_layer);

	init_bottom_panel();
}//end init

function update_position_panel(pixel,mercator,wgs84)
{
	var xyCH1903LV03 = new Object();
	xyCH1903LV03.y=WGStoCHy(wgs84.lat, wgs84.lon);
	xyCH1903LV03.x=WGStoCHx(wgs84.lat, wgs84.lon);

	OpenLayers.Util.getElement("coordinates-node-id").innerHTML = 
	'<table id="#coordinates-table-id"><tr><td>'
	+'View Pixel x,y: ' + '</td><td>&nbsp;</td><td>'
	+ (pixel.x - 0.8).toFixed(0) + ', '+(pixel.y-0.2).toFixed(0) + '</td></tr><tr><td>'
	+ 'EPSG:3857 Spherical Mercator lon,lat: ' + '</td><td>&nbsp;</td><td>'
	+ mercator.lon.toFixed(2) + ', ' + mercator.lat.toFixed(2) + '</td></tr><tr><td>'
	+ 'EPGS:4326 WGS84 lon,lat: ' + '</td><td>&nbsp;</td><td>'
	+ wgs84.lon.toFixed(6) + ', ' + wgs84.lat.toFixed(6) + '</td></tr><tr><td>'
	+ 'EPSG:21781 CH1903LV03 y,x (east,north): ' + '</td><td>&nbsp;</td><td>'
	+ xyCH1903LV03.y.toFixed(2) + ', ' + xyCH1903LV03.x.toFixed(2)
	+'</td></tr></table>';
}

function goto_home_view()
{
	//point data as WGS84 / EPSG:4326
	var lon=7.438632510
	var lat=46.951082897
	var zoom=15;

	//transform to map projection (Mercator / EPSG:3857)
	var lonLat = new OpenLayers.LonLat(lon, lat).transform(map.displayProjection, map.getProjectionObject());

	//set initial view
	map.setCenter(lonLat, zoom);
}

function prompt_goto_position()
{
	$.prompt('Comma separated LONGITUDE, LATITUDE (WGS84):'
	+'<input id="lonlat-input-id" type="text" name="lonlat_input" value=""></input>',
	{
		title: "Locate to Position"
		,buttons: { "Cancel": 0, "  OK  ": 1}
		,defaultButton: 1
		,persistent: false
		,focus: "input[name='lonlat_input']"
		,submit: function(e,v,m,f)
		{
			if(v)
			{
				var wgs84_lonlat_string=$("#lonlat-input-id").val();
				console.log("locate +"+wgs84_lonlat_string);
				var wgs84_lonlat=new OpenLayers.LonLat.fromString(wgs84_lonlat_string);
				if(!isNaN(wgs84_lonlat.lon) && !isNaN(wgs84_lonlat.lat))
				{
					var mercator_lonlat=wgs84_lonlat.clone();
					mercator_lonlat.transform(map.displayProjection,map.getProjectionObject());
					main_marker=new OpenLayers.Marker(mercator_lonlat.clone(),marker_icon);
					marker_layer.addMarker(main_marker);
					main_marker.display(true);
					map.setCenter(mercator_lonlat);
					update_position_panel(
						map.getPixelFromLonLat(mercator_lonlat)
						,mercator_lonlat
						,wgs84_lonlat
					);
				}
			}
		}
	});
}

function init_bottom_panel()
{
	$.prompt.setDefaults({
		show: 'fadeIn'
		,overlayspeed: 1
		,promptspeed: 1
		,hide: 'hide'
	});

	$('#jquery-menu-node-id').contextMenu(
	{
		selector: '.context-menu'
		,trigger: 'left'
		,callback: function(key, options)
		{
			var m = "clicked: " + key + " on " + $(this).text();
//			console.log(m);

			if(key=='home_view')
			{
				goto_home_view();
			}
			else if(key=='center_on_marker')
			{
				if(main_marker.lonlat.lon!=0 && main_marker.lonlat.lon!=0)
				{
					map.setCenter(main_marker.lonlat);
				}
			}
			else if(key=='zoom_to_marker')
			{
				if(main_marker.lonlat.lon!=0 && main_marker.lonlat.lon!=0)
				{
					var new_zoom_level=map.getZoom();
					new_zoom_level+=3;
					if(new_zoom_level>map.numZoomLevels)
					{
						new_zoom_level=map.numZoomLevels;
					}
					map.setCenter(main_marker.lonlat,new_zoom_level);
					//map.zoomIn();
				}
			}
			else if(key=='zoom_max')
			{
				map.zoomTo(map.numZoomLevels);
			}
			else if(key=='goto_position')
			{
				prompt_goto_position();
			}
		}
		,items:
		{
			"home_view": {name: "Goto Home View"}
			,"sep1": "---------"
			,"center_on_marker": {name: "Center on Marker"}
			,"zoom_to_marker": {name: "Zoom to Marker"}
			,"zoom_max": {name: "Zoom Max"}
			,"goto_position": {name: "Goto Position"}
		}
	});
}//end init_bottom_panel()
