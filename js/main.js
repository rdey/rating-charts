var appInit = function () {

	var svg_area = 'svg-area'
	var canvas_area = 'canvas-area'
	var main_color = '#bf0012'
	var graph_values = [6, 8, 0, 2.5, 5]
	var min_bar_width = 40
	var max_value = 10;
	var chart_width = 800;
	var chart_height = 300;
	var font_size = 26;
	var font_weight = 600;
	var height_if_zero = 10;
	var value_if_zero = 0.5;
	var is_zero = false;

	var add_image = function(svg_area_id){
		svg = $('#' + svg_area_id + ' svg')[0]
		var svgimg = document.createElementNS('http://www.w3.org/2000/svg','image');
		svgimg.setAttribute('height','100');
		svgimg.setAttribute('width','100');
		svgimg.setAttribute('id','testimg2');
		svgimg.setAttributeNS('http://www.w3.org/1999/xlink','href','http://i.imgur.com/LQIsf.jpg');
		//svgimg.setAttribute('xlink:href','http://i.imgur.com/LQIsf.jpg');
		svgimg.setAttribute('x','0');
		svgimg.setAttribute('y','0');

		svg.appendChild(svgimg);
	}

	var edit_chart_styles = function(canvas_area_id){
		$c = $('#'+canvas_area_id);
		$text = $c.find('text');
		_y = parseInt($text.attr('y'));

		$text.attr('font-size', font_size);
		$text.attr('font-weight', font_weight);
		$text.attr('y', _y+10);
	}

	var create_fat_border = function(_clone, _x, _y, _width) {
		_clone.attr('x', _x);
		_clone.attr('y', _y);
		_clone.attr('width', _width);
		_clone.attr('fill', '#333');
	}

	var edit_bars = function(canvas_area_id){
		var $c, $rects, $rect, max_width, _width, bar, 
			init_x, new_x, 
			init_y, new_y,
			old_border_y, $old_border;

		$c = $('#'+canvas_area_id);
		$rects = $c.find('svg [fill="' + main_color + '"]');
		$old_border = $c.find('svg rect[fill="#333333"]').eq(0);
		old_border_y = parseInt($old_border.attr('y'))-10;
		$old_border.remove();

		max_width = $rects.eq(0).attr('width');
		for(var i=0; i<$rects.length; i++){
			$rect = $rects.eq(i);
			
			//Ge bar bredd även om graph_value är 0
			bar = graph_values[i] //|| value_if_zero
			is_zero = bar ? false : true
			bar = bar || value_if_zero
			_width = is_zero ? max_width : bar/max_value * (max_width - min_bar_width) + min_bar_width;
			$rect.attr('width', _width)
			//Fixa höjd ifall höjden är 0
			_height = parseInt($rect.attr('height')) || height_if_zero;
			$rect.attr('height', _height)

			
			init_x = parseInt($rect.attr('x'));
			new_x = (max_width-_width)/2 + init_x;
			$rect.attr('x', new_x)

			//Flytta på bar i y led så att vi kan skapa tjocka borders nertill
			init_y = parseInt($rect.attr('y'));
			new_y = is_zero ? init_y - 20 - height_if_zero : init_y - 20;
			console.log(init_y, new_y);
			$rect.attr('y', new_y)

			_parent = $rect.parent();
			_clone = $rect.clone().appendTo(_parent);
			create_fat_border(_clone, init_x, old_border_y, max_width);
		}

		var c = document.getElementById(canvas_area);
	}

	var drawVisualization = function() {
		// Create and populate the data table.
		var arr = [
			['', '']
		];

		for(var i=0; i<graph_values.length; i++) {
			arr.push(
				[ String(graph_values[i]), graph_values[i] ]
			)
		}

		var data = google.visualization.arrayToDataTable(arr);
		
		var visuals = {
			chartArea:{left:'10%',top:20,width:"80%",height:"80%"},
			title: "",
		    width: chart_width, 
		    height: chart_height,
		    colors: [main_color],
		    axisTitlesPosition: 'none',
		    hAxis: {
		    	textStyle: {
		    		color: '#000',
		    		fontSize: '16px'
		    	}
		    },
		    vAxis:  {
		    	title: '',  
		    	gridlines: {
		    		count: 0
		    	}
		    },
		    series: [{visibleInLegend: false},{}, {}]
		};

		new google.visualization.ColumnChart(document.getElementById(svg_area)).draw(data, visuals);

		add_image('svg-area');
		edit_bars('svg-area');
		edit_chart_styles('svg-area');
	};

	google.setOnLoadCallback(drawVisualization);

	

	var svg_to_canvas = function(svg_area_id, canvas_area_id) {
		var svg = $('#' + svg_area_id + ' svg').parent()[0].innerHTML;
		var canvas_area = document.getElementById(canvas_area_id);
		
		return canvg(canvas_area, svg)
	}

	var canvas_to_png = function(canvas_area_id){
		var canvas = document.getElementById(canvas_area_id);
		var $image = '<image id="testimg1" xlink:href="http://i.imgur.com/LQIsf.jpg" width="100" height="100" x="0"y="0"/>'
		//var $canvas = $(canvas).append($image)
		var png = Canvas2Image.saveAsPNG(canvas);
		return png
	}

	var event_click = function() {
		var canvas = svg_to_canvas(svg_area, canvas_area)
		var png = canvas_to_png(canvas_area)

		console.log(png)

	}

	$clicks_to_png = $('.to-png')
	$clicks_to_png.on('click', event_click);
};

appInit();
