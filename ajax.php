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

 
require('../../config.php');
require(dirname(__FILE__).'/info.php');
require(dirname(__FILE__).'/functions.php') ;
require_once(WB_PATH.'/framework/class.admin.php');
$admin = new admin('Modules', 'module_view', false, false);
if (!($admin->is_authenticated() || !$admin->get_permission("minigal2", 'module'))) {
	die("Go away");
}

$basedir = WB_PATH.MEDIA_DIRECTORY.'/'.$image_path.'/';
$baseurl = WB_URL.MEDIA_DIRECTORY.'/'.$image_path.'/';


if(isset($_POST['section_id']) && is_numeric($_POST['section_id'])) {
	$section_id = (int)$_POST['section_id'];
	$curdir = $section_id."/";
	$pathToFolder = $basedir.$section_id.'/';
	$thumbFolder = $pathToFolder.'thumbs/';
	make_dir($basedir);
	make_dir($pathToFolder);
	make_dir($thumbFolder);
	$overwrite = true;
} else {
	die();
}

if(isAjax()) {
	if(isset($_POST['function'])) {
		$f = $_POST['function'];
		if($f == 'upload') {
			$get_settings = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigal2 WHERE section_id = '$section_id'");
			$settings 	= $get_settings->fetchRow();
			$maxsize 	= $settings['maxsize'];
			$maxheight 	= $settings['maxheight'];
			$thumbsize 	= $settings['thumbsize'];
			$ratio 		= $settings['ratio'];
			$thumbheight = $thumbsize;
			if(!$ratio) {
				$thumbsize = 100000; // set width to high value, we want only the height
			}
			$message 	= "";
			minigallery_save_upload ( 'file', $maxsize , $maxheight, $thumbsize, $thumbheight, $ratio, $pathToFolder, $thumbFolder, $overwrite, $message ) ;
			die ($message);
		}
		if($f == 'reload') {
			$i = getMiniGalleryImageList($basedir,$curdir,$baseurl,$section_id);
			die($i);
		}
		if($f == 'delete') {
			$filename = $_POST['file'];
			if(file_exists($pathToFolder.$filename)) unlink($pathToFolder.$filename);
			if(file_exists($thumbFolder.$filename)) unlink($thumbFolder.$filename);
			die("ok");
		}
		if($f == 'deleteall') {
			make_dir($basedir);
			rm_full_dir($thumbFolder);
			rm_full_dir($pathToFolder);
			make_dir($pathToFolder);
			make_dir($thumbFolder);
			die("");
		}
		if($f == 'caption' ) {
			$filename = $database->escapeString($_POST['file']);
			$caption = $database->escapeString($_POST['caption']);
			minigallery_save_caption ( $section_id, $filename , $caption );
			$i = getMiniGalleryImageList($basedir,$curdir,$baseurl,$section_id);
			die($i);
		}
		if($f == 'sort' ) {
			$sorting =  $database->escapeString(implode('|',$_POST['arr']));
			minigallery_save_sorting ( $section_id, $sorting );
			die();
		}

	}
}


function isAjax() {
	$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
	return $isAjax;
}
	