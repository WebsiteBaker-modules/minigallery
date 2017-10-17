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
require_once (WB_PATH.'/framework/functions.php');

// Delete page from mod_wrapper
$database->query("DELETE FROM ".TABLE_PREFIX."mod_minigal2 WHERE section_id = '$section_id'");

$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
$pathToFolder = $basedir.$section_id.'/';
$thumbFolder = $pathToFolder.'thumbs/';
rm_full_dir($thumbFolder);
rm_full_dir($pathToFolder);
?>