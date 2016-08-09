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

//for each requested tile, increment this value
//for each received tile, decrement
var tile_load_balance=0;

//init called from map.html body onload
//=============================================================================
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
		0.5971642833948135, 0.25, 0.1/*, 0.05*/
	];

/*
		156543.03390625		//00
		,78271.516953125	//01
		,39135.7584765625	//02
		,19567.87923828125	//03
		,9783.939619140625	//04
		,4891.9698095703125	//05
		,2445.9849047851562	//06
		,1222.9924523925781	//07
		,611.4962261962891	//08
		,305.74811309814453	//09
		,152.87405654907226	//10      ...
		,76.43702827453613	//11      -
		,38.218514137268066	//12      0
		,19.109257068634033	//13      1
		,9.554628534317017	//14      2
		,4.777314267158508	//15      3
		,2.388657133579254	//16      4
		,1.194328566789627	//17 ..   +
		,0.5971642833948135	//18 18   +
		,0.25			//19 +
		,0.1			//20 +
		,0.05			//21 +
*/

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
		,panRatio: 1.5
		,panDuration: 20
		,autoUpdateSize: true
	});

	var standard_baselayer_options=
	{
		resolutions: resolutions
		,serverResolutions: serverResolutions
		,isBaseLayer: true
		/*per tile action*/
		,tileOptions: {
			eventListeners: {
				'loadstart': function(evt) {
					tile_load_balance++;
					$('#tile-load-balance-id').html(tile_load_balance);
				}
				,'loadend': function(evt) {
					tile_load_balance--;
					$('#tile-load-balance-id').html(tile_load_balance);
				}
			}
		}
	};

	var standard_layer_options=
	{
		resolutions: resolutions
		,serverResolutions: serverResolutions
		,isBaseLayer: false
		/*per tile action*/
		,tileOptions: {
			eventListeners: {
				'loadstart': function(evt) {
					tile_load_balance++;
					$('#tile-load-balance-id').html(tile_load_balance);
				}
				,'loadend': function(evt) {
					tile_load_balance--;
					$('#tile-load-balance-id').html(tile_load_balance);
				}
			}
		}
	};

	//allowing an empty (white) background as baselayer
	var empty_layer = new OpenLayers.Layer.Vector("empty",standard_baselayer_options);

	//openstreetmap default layer
	var osm_layer = new OpenLayers.Layer.OSM(null,null,standard_baselayer_options);

	//some grey / black & white layers from stamen
	var stamen_toner_standard_layer = new OpenLayers.Layer.Stamen("toner",standard_baselayer_options);
	var stamen_toner_lite_layer = new OpenLayers.Layer.Stamen("toner-lite",standard_baselayer_options);
	var stamen_toner_hybrid_layer = new OpenLayers.Layer.Stamen("toner-hybrid",standard_baselayer_options);
	var stamen_toner_lines_layer = new OpenLayers.Layer.Stamen("toner-lines",standard_baselayer_options);
	var stamen_toner_background_layer = new OpenLayers.Layer.Stamen("toner-background",standard_baselayer_options);

	//layer to put (for now a single) marker
	//http://dev.openlayers.org/docs/files/OpenLayers/Layer/Markers-js.html
	marker_layer = new OpenLayers.Layer.Markers("marker");

	//http://dev.openlayers.org/docs/files/OpenLayers/Layer/Vector-js.html

	//layers served i.e. with https://github.com/7890/java_httpd and https://github.com/7890/java_osm_renderer
	//var map_server_host="localhost";
	var map_server_host="my.mapserver.foo";
	var map_server_proto="http";

	var port_range_start=18080;
	var tile_info_urls=[];
	for(var i=0;i<4;i++)
	{
		tile_info_urls.push(map_server_proto+"://"+map_server_host+":"+(port_range_start+i)+"/${z}/${x}/${y}");
	}
	console.log(tile_info_urls);

	//this layer creates tile image placeholders (eventually dynamically)
	var tile_info_layer = new OpenLayers.Layer.OSM("tile info"
	,tile_info_urls
	,standard_layer_options);

	port_range_start=18084;
	var layer_overlay1_urls=[];
	for(var i=0;i<4;i++)
	{
		layer_overlay1_urls.push(map_server_proto+"://"+map_server_host+":"+(port_range_start+i)+"/${z}/${x}/${y}");
	}
	console.log(layer_overlay1_urls);

	//this is a non-exclusive layer (i.e. not a baselayer) with or without transparency
	var layer_overlay1 = new OpenLayers.Layer.OSM("overlay 1"
	,layer_overlay1_urls
	,standard_layer_options);

/*
	port_range_start=18088;
	var layer_overlay2_urls=[];
	for(var i=0;i<4;i++)
	{
		layer_overlay2_urls.push(map_server_proto+"://"+map_server_host+":"+(port_range_start+i)+"/${z}/${x}/${y}");
	}
	console.log(layer_overlay2_urls);

	//this is a non-exclusive layer (i.e. not a baselayer) with or without transparency
	var layer_overlay2 = new OpenLayers.Layer.OSM("overlay 2"
	,layer_overlay2_urls
	,standard_layer_options);
*/

	map.addLayers([
		empty_layer
		,osm_layer
		,stamen_toner_standard_layer
		,stamen_toner_lite_layer
		,stamen_toner_hybrid_layer
		,stamen_toner_lines_layer
		,stamen_toner_background_layer

		,layer_overlay1
		/*,layer_overlay2*/
		,tile_info_layer
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

	map.events.register('moveend', map, handle_move_end);

	map.events.register("zoomend", map, handle_zoom_changed);
	function handle_zoom_changed()
	{
		//console.log(map.getZoom());
	}

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
	map.setBaseLayer(empty_layer);

	init_bottom_panel();
}//end init

//=============================================================================
function handle_move_end(e)
{
	var map_bounds=map.calculateBounds();
	var map_bounds_wgs84=map_bounds.clone();
	map_bounds_wgs84.transform(map.getProjectionObject(),map.displayProjection);

//	console.log(map_bounds_wgs84);

	map_left_bottom=new OpenLayers.Geometry.Point(map_bounds_wgs84.left,map_bounds_wgs84.bottom);
	map_left_top=new OpenLayers.Geometry.Point(map_bounds_wgs84.left,map_bounds_wgs84.top);
	map_right_bottom=new OpenLayers.Geometry.Point(map_bounds_wgs84.right,map_bounds_wgs84.bottom);
	map_right_top=new OpenLayers.Geometry.Point(map_bounds_wgs84.right,map_bounds_wgs84.top);

	var line1= new OpenLayers.Geometry.LineString([map_left_top, map_right_top]);
	var line2= new OpenLayers.Geometry.LineString([map_left_bottom, map_right_bottom]);
	var line3= new OpenLayers.Geometry.LineString([map_left_top, map_left_bottom]);
	var line4= new OpenLayers.Geometry.LineString([map_right_top, map_right_bottom]);

	var dist1= line1.getGeodesicLength(map.displayProjection);
	var dist2= line2.getGeodesicLength(map.displayProjection);
	var dist3= line3.getGeodesicLength(map.displayProjection);
	var dist4= line4.getGeodesicLength(map.displayProjection);

	OpenLayers.Util.getElement("edge-length-info-id").innerHTML = 

	'<table id="#bounds-table-id"><tr><td>'
	+'View Zoom Level: ' + '</td><td>&nbsp;</td><td>'
	+ map.getZoom() + '</td></tr><tr><td>'

	+'View Dimension Pixels w,h: ' + '</td><td>&nbsp;</td><td>'
	+ map.getSize().w + ', ' + map.getSize().h + '</td></tr><tr><td>'

	+ 'View Center lon,lat: ' + '</td><td>&nbsp;</td><td>'
	+ map_bounds_wgs84.getCenterLonLat().lon.toFixed(6) + ', '
	+ map_bounds_wgs84.getCenterLonLat().lat.toFixed(6) + '</td></tr><tr><td>'

	+ 'View Bounds (left,bottom,right,top): ' + '</td><td>&nbsp;</td><td>'
	+ map_bounds_wgs84.left.toFixed(6) + ', ' + map_bounds_wgs84.bottom.toFixed(6) + ', '
	+ map_bounds_wgs84.right.toFixed(6) + ', '+ map_bounds_wgs84.top.toFixed(6) + '</td></tr><tr><td>'

	+ 'View Edge Length (left,bottom,top,diff): ' + '</td><td>&nbsp;</td><td>'
	+ dist3.toFixed(2) + ', ' + dist1.toFixed(2) + ', '+ dist2.toFixed(2) + ', '+ (dist2-dist1).toFixed(2) + '</td>'

	+'</tr></table>';
}//end handle_move_end()

//=============================================================================
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

//=============================================================================
function goto_home_view()
{
	//point data as WGS84 / EPSG:4326
	//bern
//	var lon=7.438632510;
//	var lat=46.951082897;

	//basel
	var lon=7.589619;
	var lat=47.560166;

	var zoom=15;

	//transform to map projection (Mercator / EPSG:3857)
	var lonLat = new OpenLayers.LonLat(lon, lat).transform(map.displayProjection, map.getProjectionObject());

	//set initial view
	map.setCenter(lonLat, zoom);
}

//=============================================================================
function set_marker(wgs84_lonlat, do_center, do_pan)
{
	if(!isNaN(wgs84_lonlat.lon) && !isNaN(wgs84_lonlat.lat))
	{
		var mercator_lonlat=wgs84_lonlat.clone();
		mercator_lonlat.transform(map.displayProjection,map.getProjectionObject());
		main_marker=new OpenLayers.Marker(mercator_lonlat.clone(),marker_icon);
		marker_layer.addMarker(main_marker);
		main_marker.display(true);
		if(do_center)
		{
			if(do_pan)
			{
				map.panTo(mercator_lonlat);
			}
			else
			{
				map.setCenter(mercator_lonlat);
			}
		}
		update_position_panel(
			map.getPixelFromLonLat(mercator_lonlat)
			,mercator_lonlat
			,wgs84_lonlat
		);
	}
}

//=============================================================================
function prompt_goto_position()
{
	remove_zoom_and_layerswitcher();

	$.prompt('Comma separated LONGITUDE, LATITUDE (WGS84):'
	+'<input id="lonlat-input-id" type="text" name="lonlat_input" value=""></input>',
	{
		title: "Locate to Position"
		,buttons: { "Cancel": 0, "  OK  ": 1}
		,defaultButton: 1
		,persistent: false
		,focus: "input[name='lonlat_input']"
		,close: function(e)
		{
			map.addControl(new OpenLayers.Control.Zoom());
			map.addControl(new OpenLayers.Control.LayerSwitcher());
			map.addControl(new OpenLayers.Control.Attribution());
		}
		,submit: function(e,v,m,f)
		{
			if(v)
			{
				var wgs84_lonlat_string=$("#lonlat-input-id").val().trim();
				var wgs84_lonlat=new OpenLayers.LonLat.fromString(wgs84_lonlat_string);
				set_marker(wgs84_lonlat,true,false);
			}
		}
	});
}//end prompt_goto_position()

//=============================================================================
function remove_zoom_and_layerswitcher()
{
	//remove zoom and layerswitcher map overlays
	for(var i=0;i<map.controls.length;i++)
	{
		if(map.controls[i].CLASS_NAME=="OpenLayers.Control.LayerSwitcher")
		{
			map.removeControl(map.controls[i]);
			break;
		}
	}
	for(var i=0;i<map.controls.length;i++)
	{
		if(map.controls[i].CLASS_NAME=="OpenLayers.Control.Zoom")
		{
			map.removeControl(map.controls[i]);
			break;
		}
	}
	for(var i=0;i<map.controls.length;i++)
	{
		if(map.controls[i].CLASS_NAME=="OpenLayers.Control.Attribution")
		{
			map.removeControl(map.controls[i]);
			break;
		}
	}
}

//=============================================================================
function parse_filename_extension(filename)
{
	var re = /(?:\.([^.]+))?$/;
/*
//http://stackoverflow.com/questions/680929/how-to-extract-extension-from-filename-string-in-javascript

(?:         # begin non-capturing group
  \.        #   a dot
  (         #   begin capturing group (captures the actual extension)
    [^.]+   #     anything except a dot, multiple times
  )         #   end capturing group
)?          # end non-capturing group, make it optional
$
*/

	return re.exec(filename)[1];
}

//http://stackoverflow.com/questions/6463439/how-to-open-a-file-browse-dialog-using-javascript
//=============================================================================
function performClick(elemId)
{
	var elem = document.getElementById(elemId);
	if(elem && document.createEvent)
	{
		var evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, false);
		elem.dispatchEvent(evt);
	}
}

//var data="LINESTRING(lon lat(, lon lat)*)";
//=============================================================================
function add_wkt_layer(wkt_file,layer_name)
{
	var reader = new FileReader();
	reader.onload = function(event)
	{
		data = event.target.result;

		var data_format = new OpenLayers.Format.WKT("");
		var wkt_feature=data_format.read(data);
		wkt_feature.geometry.transform(map.displayProjection, map.getProjectionObject());

		//ratio: render more than currently in viewport -> visible when dragging
		var wkt_layer=new OpenLayers.Layer.Vector(layer_name, 
		{ratio:4
		,styleMap: new OpenLayers.StyleMap({
			"default": new OpenLayers.Style({
				fillColor: "#33CC00",
				strokeColor: "#0000aa",
				strokeWidth: 4
			})
		})},{renderers: ["SVG"]}
		);

		wkt_layer.addFeatures([wkt_feature]);
		map.addLayer(wkt_layer);
	};

	reader.onerror = function(event)
	{
		console.error("File could not be read! Code " + event.target.error.code);
	};

	reader.readAsText(wkt_file);
}//end add_wkt_layer()

//=============================================================================
function prompt_load_file()
{
	remove_zoom_and_layerswitcher();

	var file_tmp_path;
	var file_tmp;

	var format_options=
	{
		gpx: 'GPX'
		,geojson: 'GeoJSON'
		,wkt: 'WKT'
	};
	var format_dropdown = $('<select id="format-dropdown-id">');
	$.each(format_options, function(val, text)
	{
		format_dropdown.append(
			$('<option></option>').val(val).html(text)
		);
	});

	/*
	The bread and butter of Impromptu is forms. 
	By simply including form fields in the html all form values are gathered and sent via 
	the "f" (aka "form") parameter. The "m" (aka "message") parameter is a jQuery object 
	of the message itself incase you need to modify the dom. Open your javascript console 
	to view the object sent on submit.
	*/

	$.prompt('<table>'
	+'<tr><td>File:</td>'
	+'<td><input id="file-browse-id" type="file" name="file_browser" value=""></input></td></tr>'
	+'<tr><td>Format:</td>'
	+'<td>'+format_dropdown.get(0).outerHTML+'</td></tr>'
	+'<tr><td>Extract Attributes:</td>'
	+'<td><input id="extract-attrs-id" type="checkbox" name="extract_attributs" value="extract" checked></input></td></tr>'
	+'<tr><td>Layername:</td>'
	+'<td><input id="layer-name-id" type="text" name="layer_name" value=""></input></td></tr>'
	+'</table>',
	{
		title: "Load File - Import Settings"
		,buttons: { "Cancel": 0, "  OK  ": 1}
		,defaultButton: 1
		,persistent: false
		,focus: "input[name='file_browser']"
		,loaded: function(e)
		{
			//http://stackoverflow.com/questions/15201071/how-to-get-full-path-of-selected-file-on-change-of-input-type-file-using-jav
			$('#file-browse-id').change( function(event)
			{
				file_tmp_path = URL.createObjectURL(event.target.files[0]);
				file_tmp = event.target.files[0];

				var filename_extension=parse_filename_extension($("#file-browse-id").val().trim()).toLowerCase();

				//set format based on extension (guess)
				if(filename_extension=='gpx')
				{
					$("#format-dropdown-id").val("gpx");
				}
				else if(filename_extension=='json' || filename_extension=='gjson' || filename_extension=='geojson')
				{
					$("#format-dropdown-id").val("geojson");
				}
				else if(filename_extension=='txt' || filename_extension=='wkt')
				{
					$("#format-dropdown-id").val("wkt");
				}

				//enter layername or press enter
				$("#layer-name-id").focus();
			});

			//open file browse dialog automatically
			performClick('file-browse-id');
			$("#layer-name-id").focus();

		}//end loaded
		,close: function(e)
		{
			map.addControl(new OpenLayers.Control.Zoom());
			map.addControl(new OpenLayers.Control.LayerSwitcher());
			map.addControl(new OpenLayers.Control.Attribution());
		}
		,submit: function(e,v,m,f)
		{
			if(v)
			{
				var file_uri_string=$("#file-browse-id").val().trim();
				var data_format_id=$("#format-dropdown-id").val();
				var extract_attrs=$("#extract-attrs-id").is(":checked");
				var layer_name=$("#layer-name-id").val().trim();
//				console.log("file: "+file_uri_string+" "+data_format_id+" "+extract_attrs+" "+layer_name);
				if(file_uri_string!='')
				{
					if(layer_name=='')
					{
						layer_name=file_uri_string;
					}

					var data_format;
					if(data_format_id=='gpx')
					{
						data_format = new OpenLayers.Format.GPX("");
					}
					else if (data_format_id=='geojson')
					{
						data_format = new OpenLayers.Format.GeoJSON("");

					}
					else if (data_format_id=='wkt')
					{
						//handle wkt differently
						add_wkt_layer(file_tmp,layer_name);
						return;
					}

					if(extract_attrs)
					{
						data_format.extractAttributes=true;
						//geojson http://dev.openlayers.org/apidocs/files/OpenLayers/Format/GeoJSON-js.html
						data_format.ignoreExtraDims=true;
					}

					var new_layer = new OpenLayers.Layer.Vector(layer_name,
					{
						projection: map.displayProjection
						,strategies: [new OpenLayers.Strategy.Fixed()]
						,protocol: new OpenLayers.Protocol.HTTP({
							url: file_tmp_path
							,format: data_format
						})
						,styleMap: new OpenLayers.StyleMap({
							'default': new OpenLayers.Style({
								fillColor: "#ffcc66"
								,strokeColor: "#aaaa00"
								,strokeWidth: 4
								,graphicZIndex: 1
								,strokeOpacity: 1
							})
						})
					});
					map.addLayer(new_layer);
				}//end if file provided
			}//end if ok pressed
		}//end submit function
	}); //end $.prompt
}//end prompt_load_file()

/*
viewport size to fit unscaled on A4

A4: portrait:  w: 210mm h: 297mm

297 / 210  ~1.414
210 / 297  ~0.707
w: x
h: x * 1.414

images: 90 DPI
inch: 25.4mm

dots (pixels) per page width: portrait:  90 * 210 / 25.4 = 744.09  (~ 744)
dots (pixels) per page height: portrait: 90 * 297 / 25.4 = 1052.36 (~1052)
*/
//=============================================================================
function set_map_size(w, h)
{
	document.getElementById('map').style.width = w+'px';
	document.getElementById('map').style.height = h+'px';
	map.updateSize();
}

//=============================================================================
function init_bottom_panel()
{
	$.prompt.setDefaults({
		show: 'fadeIn'
		,overlayspeed: 1
		,promptspeed: 1
		,hide: 'hide'
		,zindex: 10000
	});

	var map_size_items={
		"map_size_a4_portrait": {"name": "A4 Portrait"}
		,"map_size_a4_landscape": {"name": "A4 Landscape"}
	};

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
			else if(key=='load_file')
			{
				prompt_load_file();
			}
			else if(key=='load_file')
			{
				prompt_load_file();
			}
			else if(key=='map_size_a4_portrait')
			{
				set_map_size(744,1052);
			}
			else if(key=='map_size_a4_landscape')
			{
				set_map_size(1052,744);
			}
			else if(key=='download_view_description')
			{
				downloadViewInfoXML('map_view.xml');
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
			,"set_map_size": {
				name: "Set Map Size"
				,"items": map_size_items
			}
			,"download_view_description": {name: "Download View Description"}
			,"load_file": {name: "Load File"}
		}
	});
}//end init_bottom_panel()
//EOF
