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

require('../../config.php');
require_once (WB_PATH.'/framework/functions.php');
require_once ('functions.php');
require(WB_PATH.'/modules/admin.php');
$update_when_modified = true; 
set_time_limit ( 600 );
$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
$pathToFolder = $basedir.$section_id.'/';
$thumbFolder = $pathToFolder.'thumbs/';
$overwrite = true;
$message = '';

if(isset($_POST['section_id'])) {
	$maxsize = intval($_POST['maxsize']);
	$thumbsize = intval($_POST['thumbsize']);
	$class = $admin->add_slashes(strip_tags($_POST['class']));
	$rel = $admin->add_slashes(strip_tags($_POST['rel']));
	$name = $admin->add_slashes(strip_tags($_POST['name']));
	$transition = $admin->add_slashes(strip_tags($_POST['transition']));
	$description = $admin->add_slashes(strip_tags($_POST['description']));
	$ratio = isset($_POST['ratio'])?"1":"0";
	$addscripts = isset($_POST['addscripts'])?"1":"0";
	$removefirst = isset($_POST['removecur'])?"1":"0";
	$autoplay = isset($_POST['autoplay'])?"1":"0";
	$interval = intval($_POST['interval']);
	
	$query = "UPDATE ".TABLE_PREFIX."mod_minigal2 SET 
			`name` = '$name', 
			`description` = '$description', 
			`addscripts` = '$addscripts', 
			`maxsize` = '$maxsize', 
			`thumbsize` = '$thumbsize', 
			`ratio` = '$ratio', 
			`class` = '$class', 
			`rel` = '$rel',
			`transition` = '$transition',
			`autoplay` = '$autoplay',
			`interval` = '$interval' 
			WHERE `section_id` = '$section_id'";
	$database->query($query);	

	make_dir($basedir);
	if ($removefirst) {
		rm_full_dir($thumbFolder);
		rm_full_dir($pathToFolder);
	}
	make_dir($pathToFolder);
	make_dir($thumbFolder);
	
	for($count = 1; $count <= 10; $count++) {
		save_upload ( 'image-'.$count, $maxsize , $thumbsize, $ratio, $pathToFolder, $thumbFolder, $overwrite, $message ) ;
		
		if ($message) {
			echo '<br/>'.$message;
		}
	}
}

// Check if there is a database error, otherwise say successful
if($database->is_error()) {
	$admin->print_error($database->get_error(), $js_back);
} else {
	$admin->print_success($MESSAGE['PAGES']['SAVED'], ADMIN_URL.'/pages/modify.php?page_id='.$page_id);
}

// Print admin footer
$admin->print_footer();

function save_upload ($fieldname, $resize = 0, $thumbsize = 0, $ratio, $pathToFolder, $thumbFolder, $overwrite = false, &$message) {
	$message = '';
	if(isset($_FILES[$fieldname]['tmp_name']) AND $_FILES[$fieldname]['tmp_name'] != '') {
		$filename = $_FILES[$fieldname]['name'];

		$path_parts = pathinfo($filename);
		$fileext = strtolower($path_parts['extension']);

		$new_filename = $pathToFolder.$filename;
		$thumb_filename = $thumbFolder.$filename;
		
		// Make sure the image is a jpg or png file
		if(!isImageFile($_FILES[$fieldname]['tmp_name'])) {
			$message = "Error: ".$filename. ' is invalid. Only .jpg, .gif or .png is allowed!';
			return false;
		}

		if (file_exists($new_filename) && !$overwrite) {
			$message = "Error: ".$filename. ' already exists!';
			return false;
		} else {
			$message = "Saving: ".$filename. '';
			move_uploaded_file($_FILES[$fieldname]['tmp_name'], $new_filename);
			change_mode($new_filename);
			if (file_exists($new_filename)) {
				minigallery_resize_image( $new_filename, $new_filename, $resize, 0);
				minigallery_resize_image( $new_filename, $thumb_filename, $thumbsize, $ratio, true);
				return true;
			}
		}
	}
	return false;
}

?>