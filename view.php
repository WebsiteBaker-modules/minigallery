<?php
/**
 *
 * @category        modules
 * @package         minigallery v2.2
 * @author          Dev4me / Ruud Eisinga
 * @link			http://www.allwww.nl/
 * @license         http://www.gnu.org/licenses/gpl.html
 * @platform        WebsiteBaker 2.8.x
 * @requirements    PHP 5.2.2 and higher
 * @version         2.2.0
 * @lastmodified    June 17, 2017
 *
 */

if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }

$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
$baseurl = WB_URL.MEDIA_DIRECTORY.'/minigal2/';
require_once ('functions.php');

$get_settings = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigal2 WHERE section_id = '$section_id'");
$settings = $get_settings->fetchRow();
$class = $settings['class'];
$rel = $settings['rel'];
$autoplay = $settings['autoplay'];
$interval = $settings['interval'];
if($interval == 0) $interval = 5;
$name = $settings['name'];
$description = nl2br($settings['description']);
$transition = $settings['transition'];
$addscripts = $settings['addscripts'];
$addtoimg = '';
if($addscripts) {
	$s = $autoplay ? ':slideshow':'';
	$addtoimg .= ' data-rel="lightcase:s'.$section_id.$s.'"';
	$class = 'sec-'.$section_id.' '.$class;
}
$addtoimg .= $class ? ' class="'.$class.'"':'';
$addtoimg .= $rel ? ' rel="'.$rel.'"':'';

$maxsize = ($settings['maxsize']);
$thumbsize = $settings['thumbsize'];
$ratio = $settings['ratio'];
$justify = $ratio == '0' ? " mgjustified":"";
if ($addscripts) {
	include('javascript.php');
	if(!defined('MG2_SCRIPTS_ADDED')) define ('MG2_SCRIPTS_ADDED',true); //Prevent multiple adding of jQuery and lightcase
}
$curdir = $section_id."/";

$images = getMiniGalleryImages($basedir,$curdir); 
if($images) {
	echo '<div class="minigal2">'; 
	if ($name) echo '<h1 class="mgtitle">'.$name.'</h1>';
	if ($description) echo '<div class="mgdescription">'.$description.'</div>';
	echo '<div class="mgimages'.$justify.'" id="mg'.$section_id.'">'; 
	foreach($images as $img) { 
		if (!file_exists($basedir.$curdir.'thumbs/'.basename($img['file']))) {
			minigallery_resize_image ( $basedir.$curdir.basename($img['file']), $basedir.$curdir.basename($img['file']) , $maxsize, 0 );
			minigallery_resize_image ( $basedir.$curdir.basename($img['file']), $basedir.$curdir.'thumbs/'.basename($img['file']) , $thumbsize, $ratio, true);
		}
		$info = getimagesize($basedir.$curdir.'thumbs/'.basename($img['file']));
		list($w, $h) = $info;
		echo '  <a'.$addtoimg.' href="'.str_replace(' ','%20',$baseurl.$curdir.basename($img['file'])).'">'; 
		echo '    <img width="'.$w.'" height="'.$h.'" src="'.str_replace(' ','%20',$baseurl.$curdir.'thumbs/'.basename($img['file'])).'" alt="" />'; 
		echo '  </a>'; 
	} 
	echo '</div><div class="mgclr"></div>'; 
	echo "</div>\n"; 
}