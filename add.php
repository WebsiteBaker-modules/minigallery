<?php
/**
 *
 * @category        modules
 * @package         minigallery v2
 * @author          Ruud Eisinga
 * @link			http://www.allwww.nl/
 * @license         http://www.gnu.org/licenses/gpl.html
 * @platform        WebsiteBaker 2.8.x
 * @requirements    PHP 5.2.2 and higher
 * @version         2.1.0
 * @lastmodified    Januari 25, 2015
 *
 */

if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
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
$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
$pathToFolder = $basedir.$section_id.'/';
$thumbFolder = $pathToFolder.'thumbs/';
make_dir($basedir);
make_dir($pathToFolder);
make_dir($thumbFolder);
?>