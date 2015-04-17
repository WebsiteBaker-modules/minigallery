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
require_once (WB_PATH.'/framework/functions.php');

$res = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigallery WHERE `page_id` = '$page_id' ORDER by `section_id` DESC");
if (!$res || $res->numRows() == 0 ) {
	$res = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigallery  ORDER by `section_id` DESC");
}
if (!$res || $res->numRows() == 0 ) {
	$maxsize = 800;
	$thumbsize = 100;
	$ratio = 1;
	$class = "fancybox";
	$rel = "gallery";
	$addscripts = "1";
} else {
	$settings = $res->fetchRow();
	$addscripts = ($settings['addscripts']);
	$maxsize = ($settings['maxsize']);
	$thumbsize = $settings['thumbsize'];
	$ratio = $settings['ratio'];
	$class = $settings['class'];
	$rel = $settings['rel'];
}
$name = "";
$description = "";

// Insert an extra row into the database
$database->query("INSERT INTO ".TABLE_PREFIX."mod_minigallery 
		(`page_id`,`section_id`,`addscripts`,`maxsize`,`thumbsize`,`ratio`,`class`,`rel`,`name`,`description`) 
		VALUES 
		('$page_id','$section_id','$addscripts','$maxsize','$thumbsize','$ratio','$class','$rel','$name','$description')");

// Create directories for this gallery
$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigallery/';
$pathToFolder = $basedir.$section_id.'/';
$thumbFolder = $pathToFolder.'thumbs/';
make_dir($basedir);
make_dir($pathToFolder);
make_dir($thumbFolder);
?>