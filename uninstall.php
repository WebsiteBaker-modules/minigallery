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

// Must include code to stop this file being access directly
if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
require(dirname(__FILE__).'/info.php');

$database->query("DROP TABLE `".TABLE_PREFIX."mod_minigal2`");
$database->query("DROP TABLE `".TABLE_PREFIX."mod_minigal2img`");

$basedir = WB_PATH.MEDIA_DIRECTORY.'/'.$image_path.'/';
rm_full_dir($basedir);

?>