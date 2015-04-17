<?php
/**
 *
 * @category        modules
 * @package         minigallery
 * @author          Ruud Eisinga
 * @link			http://www.allwww.nl/
 * @license         http://www.gnu.org/licenses/gpl.html
 * @platform        WebsiteBaker 2.8.x
 * @requirements    PHP 5.2.2 and higher
 * @version         0.2
 * @lastmodified    19 aug 2011
 *
 */
if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
require_once ('functions.php');

$get_settings = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigallery WHERE section_id = '$section_id'");
$settings = $get_settings->fetchRow();
$class = $settings['class'];
$rel = $settings['rel'];
$name = $settings['name'];
$description = $settings['description'];
$addscripts = $settings['addscripts'];
$addtoimg = $class ? ' class="'.$class.'"':'';
$addtoimg .= $rel ? ' rel="'.$rel.'"':'';
if ($addscripts && !defined('SCRIPTS_ADDED')) {
	define ('SCRIPTS_ADDED',true); //Prevent multiple adding of jQuery and FancyBox
	include_once('javascript.php');
}
$curdir = $section_id."/";
$images = getImages($basedir,$curdir); 
if($images) {
	echo '<div class="minigallery">'; 
	if ($name) echo '<h1>'.$name.'</h1>';
	if ($description) echo '<div class="mgdescription">'.$description.'</div>';
	echo '<div class="mgimages">'; 
	foreach($images as $img) { 
		echo '  <a'.$addtoimg.' href="'.$baseurl.$curdir.basename($img['file']).'">'; 
		echo '    <img src="'.$baseurl.$curdir.'thumbs/'.basename($img['file']).'" alt="">'; 
		echo '  </a>'; 
	} 
	echo '</div><div class="clr"></div>'; 
	echo "</div>\n"; 
}