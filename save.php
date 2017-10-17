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
	$rethumb = isset($_POST['rethumb'])?"1":"0";
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
	if ($rethumb) rm_full_dir($thumbFolder);
	make_dir($pathToFolder);
	make_dir($thumbFolder);
	
	for($count = 1; $count <= 10; $count++) {
		minigallery_save_upload ( 'image-'.$count, $maxsize , $thumbsize, $ratio, $pathToFolder, $thumbFolder, $overwrite, $message ) ;
		
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

?>