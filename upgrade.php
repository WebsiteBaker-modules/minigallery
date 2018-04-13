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

if (!function_exists('db_add_field')) {
	function db_add_field($field, $table, $desc) {
		global $database;
		$table = TABLE_PREFIX.$table;
		$query = $database->query("DESCRIBE $table '$field'");
		if(!$query || $query->numRows() == 0) { // add field
			$query = $database->query("ALTER TABLE $table ADD $field $desc");
			if($database->is_error()) {
				echo $database->get_error().'<br>';
			}
		}
	}
}
 
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

// Safely add field that was added after v0.1
$table_data = "mod_minigal2";
db_add_field("maxheight", $table_data, "INT NOT NULL DEFAULT '1000'");
db_add_field("thumbheight", $table_data, "INT NOT NULL DEFAULT '150'");
db_add_field("sorting", $table_data, "MEDIUMTEXT NULL");
