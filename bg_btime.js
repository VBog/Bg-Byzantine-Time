jQuery(document).ready(function() {
	jQuery('.bg_btime').each(function() {
		var el = document.getElementById(jQuery(this).attr('id'));
		var format = jQuery(this).attr('data-format');
		var mode = jQuery(this).attr('data-mode');
		mode = mode.split(',');
		mode[0] = parseFloat(mode[0]);
		if (mode[1]) mode[1] = parseFloat(mode[1]);
		else mode = parseFloat(mode[0]);
		var time = parseInt(jQuery(this).attr('data-time'))*1000;

		getByzantineTime (el, format, mode, time);
		if (!time && format != 'image') {
			setInterval(function () {
				getByzantineTime (el, format, mode, time);
			}, 1000);
		}
	});
});