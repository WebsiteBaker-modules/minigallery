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
 
require('../../config.php');
require( dirname(__FILE__).'/functions.php') ;
require_once(WB_PATH.'/framework/class.admin.php');
$admin = new admin('Modules', 'module_view', false, false);
if (!($admin->is_authenticated() || !$admin->get_permission("minigal2", 'module'))) {
	die("Go away");
}

if(isset($_POST['section_id']) && is_numeric($_POST['section_id'])) {
	$section_id = (int)$_POST['section_id'];
	$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
	$baseurl = WB_URL.MEDIA_DIRECTORY.'/minigal2/';
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
			$thumbsize 	= $settings['thumbsize'];
			$ratio 		= $settings['ratio'];
			$message 	= "";
			minigallery_save_upload ( 'file', $maxsize , $thumbsize, $ratio, $pathToFolder, $thumbFolder, $overwrite, $message ) ;
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

	}
}


function isAjax() {
	$isAjax = isset($_SERVER['HTTP_X_REQUESTED_WITH']) AND strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest';
	return $isAjax;
}
	