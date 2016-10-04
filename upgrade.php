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

if (!function_exists('db_add_field')) {
	function db_add_field($field, $table, $desc) {
		global $database;
		$table = TABLE_PREFIX.$table;
		$query = $database->query("DESCRIBE $table '$field'");
		if(!$query || $query->numRows() == 0) { // add field
			$query = $database->query("ALTER TABLE $table ADD $field $desc");
			echo (mysql_error()?mysql_error().'<br />':'');
			$query = $database->query("DESCRIBE $table '$field'");
			echo (mysql_error()?mysql_error().'<br />':'');
		}
	}
}
 
// Safely add field that was added after v0.1
$table_data = TABLE_PREFIX."mod_minigal2";
//db_add_field("ratio", $table_data, "INT(1) NOT NULL DEFAULT '1'");

