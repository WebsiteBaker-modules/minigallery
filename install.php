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
	
// Create table
$database->query("DROP TABLE IF EXISTS `".TABLE_PREFIX."mod_minigallery`");
$mod_simplegal = 'CREATE TABLE IF NOT EXISTS `'.TABLE_PREFIX.'mod_minigallery` ('
	. ' `section_id` INT NOT NULL DEFAULT \'0\','
	. ' `page_id` INT NOT NULL DEFAULT \'0\','
	. ' `name` VARCHAR(128) NOT NULL DEFAULT \'New MiniGallery\','
	. ' `description` TEXT NOT NULL,'
	. ' `maxsize` INT NOT NULL DEFAULT \'800\','
	. ' `thumbsize` INT NOT NULL DEFAULT \'150\','
	. ' `ratio` INT NOT NULL DEFAULT \'1\','
	. ' `class` VARCHAR(128) NOT NULL DEFAULT \'fancybox\','
	. ' `rel` VARCHAR(128) NOT NULL DEFAULT \'\','
	. ' `addscripts` INT(1) NOT NULL DEFAULT \'1\','
	. ' PRIMARY KEY ( `section_id` ) '
	. ' )';
$database->query($mod_simplegal);


?>