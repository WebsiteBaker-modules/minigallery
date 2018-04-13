<?php
/**
 *
 * @category        modules
 * @package         minigallery v2.5
 * @author          Dev4me / Ruud Eisinga
 * @link			http://www.allwww.nl/
 * @license         http://www.gnu.org/licenses/gpl.html
 * @platform        WebsiteBaker 2.8.x
 * @requirements    PHP 5.6 and higher
 * @version         2.5.1
 * @lastmodified    March 28, 2018 
 *
 */

if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
require(dirname(__FILE__).'/info.php');
$basedir = WB_PATH.MEDIA_DIRECTORY.'/'.$image_path.'/';
$baseurl = WB_URL.MEDIA_DIRECTORY.'/'.$image_path.'/';
require_once (dirname(__FILE__).'/functions.php');

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

$sorting = ($settings['sorting']);
$maxsize = ($settings['maxsize']);
$maxheight = ($settings['maxheight']);
$thumbsize = $settings['thumbsize'];
$ratio = $settings['ratio'];
$thumbheight = $thumbsize;
if(!$ratio) {
	$thumbsize = 100000; // set width to high value, we want only the height
}

include('javascript.php');
$curdir = $section_id."/";

$images = getMiniGalleryImages($basedir,$curdir,$section_id,$sorting); 
if($images) {
	echo '<div class="minigal2">'; 
	if ($name) echo '<h1 class="mgtitle">'.$name.'</h1>';
	if ($description) echo '<div class="mgdescription">'.$description.'</div>';
	echo '<div class="mgimages flex-images" id="mg'.$section_id.'">'; 
	foreach($images as $img) { 
		if (!file_exists($basedir.$curdir.'thumbs/'.basename($img['file']))) {
			minigallery_resize_image ( $basedir.$curdir.basename($img['file']), $basedir.$curdir.basename($img['file']) , $maxsize, $maxheight, 0 );
			minigallery_resize_image ( $basedir.$curdir.basename($img['file']), $basedir.$curdir.'thumbs/'.basename($img['file']) , $thumbsize, $thumbheight, $ratio, true);
		}
		$info = getimagesize($basedir.$curdir.'thumbs/'.basename($img['file']));
		list($w, $h) = $info;
		echo '	<div class="item" data-w="'.$w.'" data-h="'.$h.'">';
		echo '	<a'.$addtoimg.' href="'.str_replace(' ','%20',$baseurl.$curdir.basename($img['file'])).'">'; 
		echo '    <img src="'.WB_URL.'/modules/minigal2/blank.gif" data-src="'.str_replace(' ','%20',$baseurl.$curdir.'thumbs/'.basename($img['file'])).'" alt="'.htmlentities(nl2br($img['caption'])).'" />'; 
		if($img['caption']) echo '        <div class="caption">'.htmlentities(nl2br($img['caption'])).'</div>';			
		echo '  </a>'; 
		echo '  </div>'; 
	} 
	echo '</div><div class="mgclr"></div>'; 
	echo "</div>\n"; 
}