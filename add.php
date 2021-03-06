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
require_once (dirname(__FILE__).'/functions.php');
require_once (WB_PATH.'/framework/functions.php');

$res = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigal2 WHERE `page_id` = '$page_id' ORDER by `section_id` DESC");
if (!$res || $res->numRows() == 0 ) {
	$res = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigal2  ORDER by `section_id` DESC");
}
if (!$res || $res->numRows() == 0 ) {
	$maxsize = 1200;
	$thumbsize = 150;
	$ratio = 1;
	$class = "lightcase";
	$rel = "";
	$addscripts = "1";
	$autoplay = 0;
	$interval = 5;
	$transition = "scrollHorizontal";
} else {
	$settings = $res->fetchRow();
	$addscripts = ($settings['addscripts']);
	$maxsize = ($settings['maxsize']);
	$thumbsize = $settings['thumbsize'];
	$ratio = $settings['ratio'];
	$class = $settings['class'];
	$rel = $settings['rel'];
	$autoplay = $settings['autoplay'];
	$interval = $settings['interval'];
	$transition = $settings['transition'];
}
$name = "";
$description = "";

// Insert an extra row into the database
$database->query("INSERT INTO ".TABLE_PREFIX."mod_minigal2 
		(`page_id`,`section_id`,`addscripts`,`maxsize`,`thumbsize`,`ratio`,`class`,`rel`,`name`,`description`,`autoplay`,`interval`,`transition`) 
		VALUES 
		('$page_id','$section_id','$addscripts','$maxsize','$thumbsize','$ratio','$class','$rel','$name','$description','$autoplay','$interval','$transition')");

// Create directories for this gallery
minigallery_create_dir($section_id);
?>