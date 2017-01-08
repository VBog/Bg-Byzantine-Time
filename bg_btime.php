<?php
/* 
    Plugin Name: Bg BTime 
    Plugin URI: https://bogaiskov.ru/bg_btime/
    Description: Calculates and displays Byzantine time in your location.
    Version: 2.3
    Author: VBog
    Author URI: https://bogaiskov.ru 
	License:     GPL2
	Text Domain: bg_btime
	Domain Path: /languages
*/

/*  Copyright 2016  Vadim Bogaiskov  (email: vadim.bogaiskov@gmail.com)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
*/

/*****************************************************************************************
	Блок загрузки плагина
	
******************************************************************************************/

// Запрет прямого запуска скрипта
if ( !defined('ABSPATH') ) {
	die( 'Sorry, you are not allowed to access this page directly.' ); 
}

define('BG_BTIME_VERSION', '2.3');

// Таблица стилей для плагина
function bg_btime_enqueue_frontend_styles () {
	wp_enqueue_style( "bg_btime_styles", plugins_url( '/btime/btime.css', plugin_basename(__FILE__) ), array() , BG_BTIME_VERSION  );
}
add_action( 'wp_enqueue_scripts' , 'bg_btime_enqueue_frontend_styles' );
add_action( 'admin_enqueue_scripts' , 'bg_btime_enqueue_frontend_styles' );

// JS скрипты 
function bg_btime_enqueue_frontend_scripts () {
	wp_enqueue_script( 'bg_btime_proc1', plugins_url( 'btime/btime.js', __FILE__ ), false, BG_BTIME_VERSION, true );

	wp_localize_script( 'bg_btime_proc1', 'bg_btime', array( 
		'month1' => [__("January", 'bg_btime'), __("February", 'bg_btime'), __("March", 'bg_btime'), __("April", 'bg_btime'), __("May", 'bg_btime'), __("June", 'bg_btime'), __("July", 'bg_btime'), __("August", 'bg_btime'), __("September", 'bg_btime'), __("October", 'bg_btime'), __("November", 'bg_btime'), __("December", 'bg_btime')],
		'month2' => [__("Jan", 'bg_btime'), __("Feb", 'bg_btime'), __("Mar", 'bg_btime'), __("Apr", 'bg_btime'), __("May", 'bg_btime'), __("Jun", 'bg_btime'), __("Jul", 'bg_btime'), __("Aug", 'bg_btime'), __("Sep", 'bg_btime'), __("Oct", 'bg_btime'), __("Nov", 'bg_btime'), __("Dec", 'bg_btime')],
		'weekday1' => [__("sunday", 'bg_btime'), __("monday", 'bg_btime'), __("tuesday", 'bg_btime'), __("wednesday", 'bg_btime'), __("thursday", 'bg_btime'), __("friday", 'bg_btime'), __("saturday", 'bg_btime')],
		'weekday2' => [__("Sun", 'bg_btime'), __("Mon", 'bg_btime'), __("Tue", 'bg_btime'), __("Wed", 'bg_btime'), __("Thu", 'bg_btime'), __("Fri", 'bg_btime'), __("Sat", 'bg_btime')],
		'weekday3' => [__("Sunday", 'bg_btime'), __("Monday", 'bg_btime'), __("Tuesday", 'bg_btime'), __("Wednesday", 'bg_btime'), __("Thursday", 'bg_btime'), __("Friday", 'bg_btime'), __("Saturday", 'bg_btime')],
		'hour' => [__(" AM", 'bg_btime'), __(" PM", 'bg_btime')],
		'watch' => [__("I watch AM", 'bg_btime'), __("II watch AM", 'bg_btime'), __("III watch AM", 'bg_btime'), __("IV watch AM", 'bg_btime'), __("I watch PM", 'bg_btime'), __("II watch PM", 'bg_btime'), __("III watch PM", 'bg_btime'), __("IV watch PM", 'bg_btime')],
		'worship' => [__("Vespers", 'bg_btime'), __("Compline", 'bg_btime'), __("Midnight", 'bg_btime'), __("Matins", 'bg_btime'), __("1st hour", 'bg_btime'), __("3rd hour", 'bg_btime'), __("6th hour", 'bg_btime'), __("9th hour", 'bg_btime')])
	);
	
	wp_enqueue_script( 'bg_btime_proc2', plugins_url( 'bg_btime.js', __FILE__ ), false, BG_BTIME_VERSION, true );
}	 
if ( !is_admin() ) {
	add_action( 'wp_enqueue_scripts' , 'bg_btime_enqueue_frontend_scripts' ); 
}

// Загрузка интернационализации
add_action( 'plugins_loaded', 'bg_btime_load_textdomain' );
function bg_btime_load_textdomain() {
  load_plugin_textdomain( 'bg_btime', false, dirname( plugin_basename( __FILE__ ) ) . '/languages/' ); 
}

// Регистрируем крючок на активацию плагина
register_activation_hook( __FILE__, 'bg_btime_activate' );
function bg_btime_activate () {
}

// Регистрируем крючок на удаление плагина
if (function_exists('register_uninstall_hook')) {
	register_uninstall_hook(__FILE__, 'bg_btime_deinstall');
}
function bg_btime_deinstall() {
}

/*****************************************************************************************
	Шорт-коды
	Функции обработки шорт-кода
******************************************************************************************/
// Регистрируем шорт-код bg_btime
	add_shortcode( 'bg_btime', 'bg_btime_shortcode' );

//  [bg_btime]
function bg_btime_shortcode( $atts ) {
	extract( shortcode_atts( array(
		'format' => '',
		'size' => '',
		'mode' => '',
		'time' => ''
	), $atts ) );
	$time = strtotime ($time);
	if (!$time || $time == -1) $time = 0;
	$quote = '<span class="bg_btime" id="btime-'.wp_create_nonce(wp_generate_password()).
		'" data-format="'.$format.
		'" style="width:'.$size.'px; height:'.$size.'px"'.
		'" data-mode="'.$mode.
		'"  data-time="'.$time.'"></span>';
	return "{$quote}";
}

// Регистрируем шорт-код bg_bclock
	add_shortcode( 'bg_bclock', 'bg_bclock_shortcode' );

//  [bg_bclock]
function bg_bclock_shortcode( $atts ) {
	extract( shortcode_atts( array(
		'size' => '',
		'mode' => '',
		'time' => ''
	), $atts ) );
	
	$time = strtotime ($time);
	if (!$time || $time == -1) $time = 0;
	$quote = '<div class="bg_btime bg_bclock" id="btime-'.wp_create_nonce(wp_generate_password()).
		'" data-format="image" style="width:'.$size.'px; height:'.$size.'px"'.
		' data-mode="'.$mode.
		'" data-time="'.$time.'"></div>';
	return "{$quote}";
}

