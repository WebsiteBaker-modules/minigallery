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
	
$database->query("DROP TABLE IF EXISTS `".TABLE_PREFIX."mod_minigal2`");
$mod_simplegal = 'CREATE TABLE IF NOT EXISTS `'.TABLE_PREFIX.'mod_minigal2` ('
	. ' `section_id` INT NOT NULL DEFAULT \'0\','
	. ' `page_id` INT NOT NULL DEFAULT \'0\','
	. ' `name` VARCHAR(128) NOT NULL DEFAULT \'New Gallery\','
	. ' `description` TEXT NOT NULL,'
	. ' `maxsize` INT NOT NULL DEFAULT \'1600\','
	. ' `maxheight` INT NOT NULL DEFAULT \'1000\','
	. ' `thumbsize` INT NOT NULL DEFAULT \'150\','
	. ' `thumbheight` INT NOT NULL DEFAULT \'150\','
	. ' `ratio` INT NOT NULL DEFAULT \'1\','
	. ' `autoplay` INT NOT NULL DEFAULT \'0\','
	. ' `interval` INT NOT NULL DEFAULT \'5\','
	. ' `class` VARCHAR(128) NOT NULL DEFAULT \'lightcase\','
	. ' `rel` VARCHAR(128) NOT NULL DEFAULT \'\','
	. ' `transition` VARCHAR(128) NOT NULL DEFAULT \'scrollHorizontal\','
	. ' `addscripts` INT(1) NOT NULL DEFAULT \'1\','
	. ' `sorting` MEDIUMTEXT NULL ,'
	. ' PRIMARY KEY ( `section_id` ) '
	. ' )';
$database->query($mod_simplegal);

$database->query("DROP TABLE IF EXISTS `".TABLE_PREFIX."mod_minigal2img`");
$mod_simplegal_img = 'CREATE TABLE IF NOT EXISTS `'.TABLE_PREFIX.'mod_minigal2img` ('
	. ' `image_id` INT(11) NOT NULL auto_increment,'
	. ' `section_id` INT NOT NULL DEFAULT \'0\','
	. ' `position` INT(11) NOT NULL DEFAULT \'0\','
	. ' `image` VARCHAR(255) NOT NULL DEFAULT \'\','
	. ' `alt` VARCHAR(255) NOT NULL DEFAULT \'\','
	. ' `title` TEXT NOT NULL,'
	. ' PRIMARY KEY ( `image_id` ) '
	. ' )';
$database->query($mod_simplegal_img);

$path = WB_PATH.'/modules/minigal2/';
if(file_exists($path.'new_frontend.css')) {
	if(!rename($path.'new_frontend.css',$path.'frontend.css')) {
		echo "<h2>Error renaming frontend.css. Please rename new_frontend.css manually to frontend.css</h2>";
	}
}



?>