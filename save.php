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
require('../../config.php');
require_once (WB_PATH.'/framework/functions.php');
require(WB_PATH.'/modules/admin.php');
$update_when_modified = true; 
set_time_limit ( 600 );
$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigallery/';
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
	$description = $admin->add_slashes(strip_tags($_POST['description']));
	$ratio = isset($_POST['ratio'])?"1":"0";
	$addscripts = isset($_POST['addscripts'])?"1":"0";
	$removefirst = isset($_POST['removecur'])?"1":"0";
	
	$query = "UPDATE ".TABLE_PREFIX."mod_minigallery SET 
			`name` = '$name', 
			`description` = '$description', 
			`addscripts` = '$addscripts', 
			`maxsize` = '$maxsize', 
			`thumbsize` = '$thumbsize', 
			`ratio` = '$ratio', 
			`class` = '$class', 
			`rel` = '$rel' 
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
		if($fileext != "jpg") {
			$message = "Error: ".$filename. ' is invalid. Only .jpg is allowed!';
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
				do_resize ( $new_filename, $new_filename , $resize, 0,  $message );
				do_resize ( $new_filename, $thumb_filename , $thumbsize, $ratio, $message );
				return true;
			}
		}
	}
	return false;
}

function do_resize($source, $destination, $size, $crop = 0, &$message) {

	$cropfile = $source;
	$source_img = @imagecreatefromjpeg($cropfile); //Create a copy of our image for our thumbnails...
	if (!$source_img) {
		return false;
	}
	$orig_w = imagesx($source_img);
	$orig_h = imagesy($source_img);
	$src_x = 0;
	$src_y = 0;

	if(!$crop) {
		
		if ($orig_w < $size && $orig_h < $size ) { 
			return false;  //Image smaller than resize size
		}
		if ($orig_w > $orig_h) {
			$crop_w = $size;
			$crop_h = $orig_h*($size/$orig_w);
		}
		if ($orig_w < $orig_h) {
			$crop_w = $orig_w*($size/$orig_h);
			$crop_h = $size;
		}
		if ($orig_w == $orig_h) {
			$crop_w = $size;
			$crop_h = $size;	
		}
		$new_h = $crop_h;
		$new_w = $crop_w;
		
	} else {
		
		$w_ratio = ($size / $orig_w);
		$h_ratio = ($size / $orig_h);
		$new_h = $size;
		$new_w = $size;
			
		if ($orig_w > $orig_h ) {
			$crop_w = round($orig_w * $h_ratio);
			$crop_h = $size;
			$src_x = ceil( ( $orig_w - $orig_h ) / 2 );
			$src_y = 0;
		} elseif ($orig_w < $orig_h ) {
			$crop_h = round($orig_h * $w_ratio);
			$crop_w = $size;
			$src_x = 0;
			$src_y = ceil( ( $orig_h - $orig_w ) / 2 );
		} else {
			$crop_w = $size;
			$crop_h = $size;
			$src_x = 0;
			$src_y = 0;
		}
	}
	$dest_img = imagecreatetruecolor($new_w,$new_h);
	imagecopyresampled($dest_img, $source_img, 0 , 0 , $src_x, $src_y, $crop_w, $crop_h, $orig_w, $orig_h); 
	if(imagejpeg($dest_img, $destination)){
		imagedestroy($dest_img);
		imagedestroy($source_img);
	} 
}
?>