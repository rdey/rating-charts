$(document).ready(function() {
  svg = $('#svg-area').gchart2png({
  	graph_values: [6, 6, 4, 5, 6.5]
  });
  
  $('.to-png').on('click', function(){
	svg.data('gchart2png').generate_image();
  });

});
