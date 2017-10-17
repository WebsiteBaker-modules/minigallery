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
	
$database->query("DROP TABLE IF EXISTS `".TABLE_PREFIX."mod_minigal2`");
$mod_simplegal = 'CREATE TABLE IF NOT EXISTS `'.TABLE_PREFIX.'mod_minigal2` ('
	. ' `section_id` INT NOT NULL DEFAULT \'0\','
	. ' `page_id` INT NOT NULL DEFAULT \'0\','
	. ' `name` VARCHAR(128) NOT NULL DEFAULT \'New Gallery\','
	. ' `description` TEXT NOT NULL,'
	. ' `maxsize` INT NOT NULL DEFAULT \'1200\','
	. ' `thumbsize` INT NOT NULL DEFAULT \'150\','
	. ' `ratio` INT NOT NULL DEFAULT \'1\','
	. ' `autoplay` INT NOT NULL DEFAULT \'0\','
	. ' `interval` INT NOT NULL DEFAULT \'5\','
	. ' `class` VARCHAR(128) NOT NULL DEFAULT \'lightcase\','
	. ' `rel` VARCHAR(128) NOT NULL DEFAULT \'\','
	. ' `transition` VARCHAR(128) NOT NULL DEFAULT \'scrollHorizontal\','
	. ' `addscripts` INT(1) NOT NULL DEFAULT \'1\','
	. ' PRIMARY KEY ( `section_id` ) '
	. ' )';
$database->query($mod_simplegal);


$path = WB_PATH.'/modules/minigal2/';
if(file_exists($path.'new_frontend.css')) {
	if(!rename($path.'new_frontend.css',$path.'frontend.css')) {
		echo "<h2>Error renaming frontend.css. Please rename new_frontend.css manually to frontend.css</h2>";
	}
}



?>