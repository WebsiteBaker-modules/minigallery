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

// Must include code to stop this file being access directly
if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }

$database->query("DROP TABLE ".TABLE_PREFIX."mod_minigal2");
rm_full_dir(WB_PATH.MEDIA_DIRECTORY.'/minigal2/');

?>