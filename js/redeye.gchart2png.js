
(function( $ ){
    $.gchart2png = function(element, options) {

        var defaults = {
            svg_area:               '#svg-area',
            canvas_area:            '#canvas-area',
            colors:                 ['#bf0012'],
            graph_values:           [6, 8, 0, 2.5, 5],
            min_bar_width:          40,
            max_value:              10,
            chart_width:            600,
            chart_height:           300,
            font_size:              40,
            font_weight:            600,
            height_if_zero:         10,
            value_if_zero:          0.5,
            min_height:             20,
            y_axis_max:             10,    
            y_axis_min:             0,
            diff_y:                 20
        }

        var plugin = this;

        plugin.settings = {}
    
        var $element = $(element),
            element = element,
            $svg_area = $element, 
            svg_area_el = element,
            
            $canvas_area, canvas_el,
            svg_el, $svg, svg_html,
            chart;

        plugin.init = function() {
            plugin.settings = $.extend({}, defaults, options);

            //Globals
            $canvas_area = $(plugin.settings.canvas_area);
            canvas_el = $canvas_area[0];

            //Bind Events
            this.init_events();
            $element.bind('generate_image', plugin.generate_image)
        };

        plugin.init_events = function() {
            google.setOnLoadCallback(plugin.draw_chart);
        };

        plugin.generate_image = function(){
            var canvas = plugin.svg_to_canvas()
            var png = plugin.canvas_to_jpg()
        };

        plugin.svg_to_canvas = function(){
            $svg = $(plugin.settings.svg_area + ' svg');
            svg_html = $svg.parent()[0].innerHTML;
            return canvg(canvas_el, svg_html)
        };

        plugin.canvas_to_png = function(){
            var canvas = canvas_el;
            var png = Canvas2Image.saveAsPNG(canvas);
            return png
        };

        plugin.canvas_to_jpg = function(){
            var canvas = canvas_el;
            var jpg = Canvas2Image.saveAsJPEG(canvas);
        }

        plugin.custom_styling = function(){
            plugin.edit_bars();
            plugin.edit_chart_styles();
        };

        plugin.edit_chart_styles = function() {
            var $text, _y;
            $text = $svg_area.find('text');
            _y = parseInt($text.attr('y'));

            $text.attr('font-size', plugin.settings.font_size);
            $text.attr('font-weight', plugin.settings.font_weight);
            $text.attr('y', _y+20);
        };

        plugin.create_fat_border = function(_clone, _x, _y, _width){
            _clone.attr('x', _x);
            _clone.attr('y', _y);
            _clone.attr('width', _width);
            _clone.attr('fill', '#333');
        };

        plugin.edit_bars = function(){
            var $c, $rects, $rect, max_width, _width, bar, 
                init_x, new_x, 
                init_y, new_y,
                old_border_y, $old_border,
                _parent, _clone

            $rects = $svg_area.find('svg [fill="' + plugin.settings.colors[0] + '"]');
            $old_border = $svg_area.find('svg rect[fill="#333333"]').eq(0);
            old_border_y = parseInt($old_border.attr('y'))-10;
            $old_border.remove();

            max_width = $rects.eq(0).attr('width');
            for(var i=0; i<$rects.length; i++){
                var is_less_than_min_height=false, is_zero=false;
                $rect = $rects.eq(i);
                
                bar = plugin.settings.graph_values[i] //|| value_if_zero
                plugin.settings.is_zero = bar ? false : true

                //Ge bar bredd även om graph_value är 0
                bar = bar || plugin.settings.value_if_zero

                //Om graph_value är 0 så sätter vi bredden till max_width, annars beräkna bredden enligt graph_value.
                _width = plugin.settings.is_zero ? max_width : bar/plugin.settings.max_value * (max_width - plugin.settings.min_bar_width) + plugin.settings.min_bar_width;
                $rect.attr('width', _width)
                
                //Fixa höjd ifall höjden är 0 eller mindre än min_height

                _height = parseInt($rect.attr('height'))
                if(_height == 0) {
                    _height = plugin.settings.height_if_zero;
                    is_zero = true;
                } else if (_height < plugin.settings.min_height) {
                    _height = plugin.settings.min_height;
                    is_less_than_min_height = true;
                }
                $rect.attr('height', _height)
                

                //Flytta bars i sidled efter att de skalats om
                init_x = parseInt($rect.attr('x'));
                new_x = (max_width-_width)/2 + init_x;
                $rect.attr('x', new_x)

                //Flytta på bar i y led så att vi kan skapa tjocka borders nertill
                init_y = parseInt($rect.attr('y'));
                if (is_zero) {
                    new_y = init_y - plugin.settings.diff_y - plugin.settings.height_if_zero;
                } else if (is_less_than_min_height) {
                    new_y = init_y - plugin.settings.diff_y - plugin.settings.min_height;
                } else {
                    new_y = init_y - plugin.settings.diff_y;
                }
                $rect.attr('y', new_y)

                //Skapa tjock border under bar.
                _parent = $rect.parent();
                _clone = $rect.clone().appendTo(_parent);
                plugin.create_fat_border(_clone, init_x, old_border_y, max_width);
            }
        };

        plugin.draw_chart = function() {
            var arr = [
                ['', '']
            ];

            for(var i=0; i<plugin.settings.graph_values.length; i++) {
                var obj = plugin.settings.graph_values[i]; 
                arr.push(
                    [ String(obj), obj ]
                )
            }

            var data = google.visualization.arrayToDataTable(arr);
            
            var visuals = {
                chartArea:{left:'0%',top:20,width:"100%",height:"80%"},
                title: "",
                bar: {groupWidth: 110},
                width: plugin.settings.chart_width, 
                height: plugin.settings.chart_height,
                colors: plugin.settings.colors,
                axisTitlesPosition: 'none',
                hAxis: {
                    textStyle: {
                        color: '#000',
                        fontSize: '16px'
                    }
                },
                vAxis:  {
                    maxValue: plugin.settings.y_axis_max,
                    minValue: plugin.settings.y_axis_min,
                    title: '',  
                    gridlines: {
                        count: 0
                    }
                },
                series: [{visibleInLegend: false},{}, {}]
            };

            chart = new google.visualization.ColumnChart(svg_area_el);
            google.visualization.events.addListener(chart, 'ready', function(){
                plugin.custom_styling();
            });
            chart.draw(data, visuals);
        };

        plugin.init();
    };

    $.fn.gchart2png = function(options) {
        return this.each(function() {
            if (undefined == $(this).data('gchart2png')) {
                var plugin = new $.gchart2png(this, options);
                $(this).data('gchart2png', plugin);
            }
        });

    }

})( jQuery );