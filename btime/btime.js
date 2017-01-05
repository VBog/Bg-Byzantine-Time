/**************************************************************
Функция getByzantineTime выводит на экран византийское время

Версия: 1.0 от 05.01.2017

Пример:
	https://bogaiskov.ru/location.html

Используются:
	- 	Sunrise/Sunset Algorithm 
		by Nautical Almanac Office US Naval Observatory
	- 	HTML5 Geolocation API

Параметры:
	x - элемент, в который будет передан html-текст, 
		содержащий информацию о текущем времени.
		
	format - формат отображения византийского времени. 
		Используйте следующие плейсхолдеры:
		%h - час (0...23),
		%0h - то же с ведущим нулем,
		%1h - час (1...12) без указания дня/ночи,
		%H - час (1-й...12-й час дня/ночи),
		%l - лепта (0...9),
		%0l - то же с ведущим нулем,
		%j - мойра (0...14),
		%0j - то же с ведущим нулем,
		%r - рипа (0...7),
		%0r - то же с ведущим нулем,
		%w - стража,
		%s - богослужение.
	
		По умолчанию: format="%0h:%0l:%0j:%0r - %w (%s)".	
	
	mode - режим работы функции. 
		1.Если передан массив, то это координаты места. 
		Сутки по Византийскому времени начинаются 
		с заходом солнца, поэтому их начало зависит от даты 
		и местоположения (долготы и широты).
			1 Сутки = 24 часа
			1 Час = 10 лепт
			1 Лепта = 15 мойр
			1 Мойра = 8 рип
		Византийское время не может быть определено 
		за полярным кругом (Широта по модулю > 66.5622).
		Если заданы координаты за полярным кругом, то 
		функция получает текущие координаты пользователя
		и расчитывает для них Византийское время. 
		Если получить координаты невозможно или 
		пользователь находится за полярным кругом, 
		то расчитывается псевдо-византийское время 
		с полночью в 18:00.
		2. Иначе - это час начала вечернего богослужения
		для расчета церковного (псевдо-византийского) 
		времени.
		Сутки по Церковному (псевдо-византийскому) времени 
		начинаются с принятым на приходе началом вечерней 
		службы. Как правило это: 16, 17 или 18 часов.
		Если mode не число, или его значение лежит 
		за пределами диапазона от 0 до 24, то расчитывается 
		псевдо-византийское время с полночью в 18:00.
		
		По умолчанию mode=[90,0] (Северный полюс) - 
		то есть функция будет пытаться определить координаты 
		пользователя.
		
	time - гражданское время по Григорианскому календарю 
		в милисекундах, прошедшее с 1 января 1970 года, 
		для которого необходимо определить византийское время.
		Если time = 0, то принимается текушее время пользователя.
		
		По умолчанию time = 0.
		
Возвращает:
	true 	- если отображено византийское время,
	false 	- если отображено церковное время или ошибка.
		
*****************************************************************/
function getByzantineTime (x, format="", mode=[90,0], time=0 ) {
	if (!x || (x === undefined) || (x.innerHTML === undefined)) return false;
	if (!format) format="%0h:%0l:%0j:%0r - %w (%s)";
	
	if (time) var d = new Date(time);
	else {
		var d = new Date ();
		time = d.getTime();
	}

	if (mode instanceof Array) {
	// Византийское время в точке с заданными координатами	
		if (Math.abs(mode[0]) >= 66.5622){	// Если заданы координаты за полярным кругом, то 
			// получаем текущие координаты и расчитываем для них Византийское время	
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(function(position) {
					if (Math.abs(position.coords.latitude) < 66.5622) {
						localT = sunTime ( position.coords.latitude, position.coords.longitude, time );
						showDigitalBTime( localT, time, x, format );
						return true;
					} else {	// За полярным кругом выдаем псевдо-византийское время с полночью в 18:00
						showDigitalBTime( 18, time, x, format );
						return false;
					}
				});
			} else {								// Если определение геопозиции не возможно, 
				showDigitalBTime( 18, time, x );	// выдаем псевдо-византийское время с полночью в 18:00
			}
		} else {
			localT = sunTime ( mode[0], mode[1], time );
			showDigitalBTime( localT, time, x, format );
			return true;
		}
	} else {
		// Церковное время (псевдо-византийское время)
		if (typeof mode !== 'number' || mode < 0 || mode > 24) mode = 18;
		showDigitalBTime( mode, time, x, format );
		return false;
	}
}

/**************************************************************
Отображение на экране византийского времени

	localT 	- время заката солнца в часах.
	time 	- время по Григорианскому календарю в мсек. 
	x 		- элемент, в который будет передан html-текст.
	format 	- формат отображения византийского времени. 
*****************************************************************/
function showDigitalBTime ( localT, time, x, format ) {
	bt = time + (24 - localT)*60*60*1000;
	d = new Date(bt);
	h = d.getHours();					// Часы 
	m = d.getMinutes();
	l = parseInt(m/6);					// Лепты	(1 час = 10 лепт, 1 лепта = 6 минут)
	s = d.getSeconds();
	j = parseInt(((m-l*6)*60+s)/24);	// Мойры	(1 лепта = 15 мойр, 1 мойра = 24 секунды)
	r = parseInt(((m-l*6)*60+s-j*24)/3);// Рипы		(1 мойра = 8 рип, 1 рипа = 3 секунды)
	format = format.replace("%h", h);
	format = format.replace("%0h",(h>9)?h:("0"+h));
	format = format.replace("%1h",(h<12)?(h+1):(h-11));
	format = format.replace("%H", (h<12)?((h+1)+"-й час ночи"):((h-11)+"-й час дня"));
	format = format.replace("%l", l);
	format = format.replace("%0l",(l>9)?l:("0"+l));
	format = format.replace("%j", j);
	format = format.replace("%0j",(j>9)?j:("0"+j));
	format = format.replace("%r", r);
	format = format.replace("%0r",(h>9)?r:("0"+r));
	format = format.replace("%w",watch(h));
	format = format.replace("%s",worship(h));
	x.innerHTML = format;
	return;
	
	function watch (h) {
		if (h < 3) t = "I стража ночи";
		else if (h < 6) t = "II стража ночи";
		else if (h < 9) t = "III стража ночи";
		else if (h < 12) t = "IV стража ночи";
		else if (h < 15) t = "I стража дня";
		else if (h < 18) t = "II стража дня";
		else if (h < 21) t = "III стража дня";
		else t = "IV стража дня";
		return t;
	}
	function worship (h) {
		if (h < 3) t = "Вечерня";
		else if (h < 6) t = "Повечерие";
		else if (h < 9) t = "Полунощница";
		else if (h < 12) t = "Утреня";
		else if (h < 15) t = "1-ый час";
		else if (h < 18) t = "3-ий час";
		else if (h < 21) t = "6-ой час";
		else t = "9-ый час";
		return t;
	}
}

/**************************************************************
Расчет времени восхода/заката солнца

Sunrise/Sunset Algorithm Example

Source:
	Almanac for Computers, 1990
	published by Nautical Almanac Office
	United States Naval Observatory
	Washington, DC 20392
	
http://williams.best.vwh.net/sunrise_sunset_example.htm

 	latitude	- широта.
	longitude	- долгота.
	time 		- время по Григорианскому календарю в мсек. 
	stype		- 1 - восход, 0 - закат.
	ztype		- тип положения солнца в зените см. ниже (0...3). 
	Sun's zenith for sunrise/sunset
	zenith:               
		offical      = 90 degrees 50'
		civil        = 96 degrees
		nautical     = 102 degrees
		astronomical = 108 degrees
 
Возвращает время восхода/заката солнца в часах
*****************************************************************/
function sunTime ( latitude, longitude, time=0, stype=0, ztype=0){	
// Sun's zenith for sunrise/sunset
	var zenith = [90.83333333333, 96, 102, 108];   
	
	if (time) var d = new Date (time);
	else {
		var d = new Date ();
		time = d.getTime();
	}
//	calculate the day of the year
	var dd = numDay(time);
			
//	convert the longitude to hour value and calculate an approximate time
	var lngHour = longitude / 15;
	if (stype) var t = dd + ((6 - lngHour) / 24);		//if rising time is desired	
	else var t = dd + ((18 - lngHour) / 24);			//if setting time is desired 
	
//	calculate the Sun's mean anomaly
	var M = (0.9856 * t) - 3.289;
	
//	calculate the Sun's true longitude
	var L = M + (1.916 * Math.sin(Math.PI*M/180)) + (0.020 * Math.sin(2 * Math.PI*M/180)) + 282.634;
	
//	calculate the Sun's right ascension
	var RA = 180*Math.atan(0.91764 * Math.tan(Math.PI*L/180))/Math.PI;
//	right ascension value needs to be in the same quadrant as L
	var Lquadrant  = (Math.floor( L/90)) * 90;
	var RAquadrant = (Math.floor(RA/90)) * 90;
	RA = RA + (Lquadrant - RAquadrant);
//	right ascension value needs to be converted into hours	
	RA = RA / 15;
	
//	calculate the Sun's declination
	var sinDec = 0.39782 * Math.sin(Math.PI*L/180);
	var cosDec = Math.cos(Math.asin(sinDec));

//	calculate the Sun's local hour angle
	var cosH = (Math.cos(Math.PI*zenith[ztype]/180) - (sinDec * Math.sin(Math.PI*latitude/180))) / (cosDec * Math.cos(Math.PI*latitude/180));
//	finish calculating H and convert into hours
	if (stype) var H = -180*Math.acos(cosH)/Math.PI;	//if rising time is desired
	else var H = 180*Math.acos(cosH)/Math.PI;			//if setting time is desired
	H = H / 15;

//	calculate local mean time of rising/setting
	var T = H + RA - (0.06571 * t) - 6.622;
//	adjust back to UTC
	var UT = T - lngHour;
//	convert UT value to local time zone of latitude/longitude
	var localT = UT - d.getTimezoneOffset()/60;
	
	return localT;

	function numDay(time) {
		d = new Date(time);
		d0 = new Date(d.getFullYear(), d.getMonth(), d.getDate());
		d1 = new Date(d.getFullYear(), 0, 1);
		dd = parseInt((d0.getTime() - d1.getTime())/(1000*60*60*24))+1;
		return dd;
	}
}
