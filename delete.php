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

// Delete page from mod_wrapper
$database->query("DELETE FROM ".TABLE_PREFIX."mod_minigallery WHERE section_id = '$section_id'");

$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigallery/';
$pathToFolder = $basedir.$section_id.'/';
$thumbFolder = $pathToFolder.'thumbs/';
rm_full_dir($thumbFolder);
rm_full_dir($pathToFolder);
?>