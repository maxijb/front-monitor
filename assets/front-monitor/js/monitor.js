$(document).ready(function() {
	
	//login
	$('.frame-login').find('input').keypress(function(e) {
		if (e.keyCode == 13) {
			$(this).closest('form').find('.submit').click();
		}
	})
	.end()
	.find('.submit').click(function() {
		$.get('/tryAuth?' + $('form').serialize(), function(d) {
			if (d == "ok") {
				var url = window.location.href.replace('login', '');
				window.location.href = url;
				// console.log(url);
			}
			else {
				$('.message').html(d);
			}
		})
	})


	$('form input').keypress(function(e) {
		if (e.keyCode == 13) {
			$('.do_search').click();
		}
	})

	$('.reload').click(function() {
		getGraph(false);
		getClusters(false);	
	}).click();


	$('.do_search').click(function() {
		getGraph(true);
		getClusters(true);
	});

	$('.dropdown-menu li').click(function() {
		var obj = $(this).find('a:first');
		// var id = obj.data('id');
		$(this).closest('.dropdown').find('a:first').html(obj.text() + ' <b class="caret"></b>').data('id', obj.data('id'));
		// if ($(this).closest('ul.nav').data('id') == "applications") {
		window.location.href = "?application=" + $('#applications a:first').data('id') + "&timeframe=" + $('#timestamps a:first').data('id');
		// }
		
		// $('.reload').click();
	})


	$('#main').on('click', 'td .btn', function() {
		var data = $(this).closest('tr').data('row');
		data = data.toString().split(',');
		var html = '';
		for (var i in data) {

			html += "<a id='" + data[i] + "' class='error'>Error Nº " + data[i] + "</a>";
		}
		$('#popup').addClass('loading').fadeIn(300).find('.errors').html(html).find('.error:first').click();
		debugger;
		$(document).off('keydown.escape').on('keydown.escape', function(e) {
			console.log(e.keyCode);
			if (e.keyCode == 27) $('#popup .close').click();
		});
	});

	$('#popup').on('click', '.error', function() {
		if ($(this).hasClass('active')) return;
		var errorid = this.id;
		$(this).addClass('active').siblings().removeClass('active');
		$.get('/error?id=' + this.id, function(d) {
			if (d.length) {
				d = d[0];
				var html = '<h4>Error nº '+errorid+' data</h4>';
				for (var i in d) {
					// console.log(d[i].substr(0,7));
					if (typeof d[i] == "string" && d[i].substr(0,7) == 'http:\/\/') {
						d[i] = "<a href='" + d[i] + "' target='_blank'>" + d[i] + "</a>";
					}
					var parseBtn = (i == "user_agent") ? "<a class='parse btn'>Parse</a>" : '';
					if (i != 'id' && i != "pageview")
					html += "<p><label>" + i + ": </label><span>" +d[i]+"</span>" +parseBtn+ "</p>";  

				}
				$('#popup').removeClass('loading').find('.frame').html(html);
			}
		}, 'json')
	}).on('click', '.parse', function() {
		var id = $("#popup .error.active").attr('id');
		var $this = $(this);
		$.get("/parseUA?id=" + id, function(d) {
			$this.closest('p').after("<p class='user_agent'>" + JSON.stringify(d) + "</p>").next().slideDown(500);
		})
	});

	$('#popup .close').click(function() {
		$('#popup').fadeOut(300);
		$(document).off('keydown.escape');
	})


});



function getGraph(filtered) {
	var params = getParams(filtered);
	$.get("/admin/getGraph", params, function(d) {
		// $('#graph').html(JSON.stringify(d));
		var myData = [];
	var myChart = new JSChart('graph', 'line');



		for (var i = 0; i <= d.units ; i++) {
			if (d.data[i]) {
				myData.push([i, d.data[i].quantity]);
				myChart.setTooltip([i,JSON.stringify(d.data[i])]);
			}
			else myData.push([i, 0]);
		}




		console.log(myData);
		// var myData = new Array([10, 2], [15, 0], [18, 3], [19, 6], [20, 8.5], [25, 10], [30, 9], [35, 8], [40, 5], [45, 6], [50, 2.5]);
	myChart.setSize($('#graph').width(), $('#graph').height());
	// myChart.setLineSpeed(95);
	myChart.setDataArray(myData);
	myChart.setAxisValuesNumberX(d.units);
	myChart.setLineSpeed(100);
	myChart.setFlagRadius(5);
	myChart.setLineColor('#8D9386');
	myChart.setLineWidth(3);
	myChart.setTitleColor('#7D7D7D');
	myChart.setAxisValuesColorX('#fff');
	myChart.setAxisColor('#38a4d9');
	myChart.setLineColor('#C71112');
	myChart.setAxisNameColor('#333639');
	myChart.setAxisNameY('Errors');
	myChart.setAxisNameX('Time');
	myChart.setTextPaddingLeft(0);
	myChart.setLabelColorX("#38a4d9");
	myChart.clearLabels();
	for (var i in d.labels) {
	myChart.setLabelX([d.labels[i].index,d.labels[i].date]);

	}
	myChart.draw();



	}, 'json');
}



function getClusters(filtered) {
	var params = getParams(filtered);
	console.log(getParams());
	$.get("/admin/getClusters", params, function(d) {
		$('#results').html(d);
	});
}


function getParams(filtered) {
	return {
		application : $('#applications a:first').data('id'),
		timeframe : $('#timestamps a:first').data('id'),
		groupBy : $('#main .refine input[type=checkbox]:checked').map(function() { 
																				return $(this).attr('class');
																			}).get().join() ,
		url : (filtered) ? $('#url_input').val() : "",
		text: (filtered) ? $('#text_input').val() : "",
		uow : (filtered) ? $('#uow_input').val() : ""
	};
}

function search() {
	alert("si");
	$('.do_search').click();
}