$(document).ready(function() {
	var $container = $('.container.rules');

	if (!$container.length) return;

	$('#create').on('click', function() {
		$('.line.example').clone().removeClass('example').insertBefore(this);
	});

	$container.on('change', 'select, input', function() {
		$(this).closest('.line').addClass('modified');
	})
	.on('keydown', 'input', function() {
		$(this).closest('.line').addClass('modified');
	})
	.on('click', '.save', function() {
		var line = $(this).closest('.line');
		var id = line.attr('id');
		var method = id && id > 0 ? "update/" + id : "create";
		var field = line.find('.field select').val();
		var condition = line.find('.condition select').val();
		var value = line.find('.value input').val();
		var application_id = line.data('application');
		$.get("/front-monitor/rules/"+method, {field: field, condition: condition, value: value, application_id : application_id}, function(data) {
			if (data.id) line.attr('id', data.id);
			line.removeClass('modified').removeClass('unsaved');
		})
	})
	.on('click', '.delete', function() {
		var line = $(this).closest('.line');
		var id = line.attr('id');
		$(this).fadeOut();
		$.get("/front-monitor/rules/destroy/"+id, function() {
			line.fadeOut(400, function() {
				$(this).remove();
			})
		})
	})
});	
	