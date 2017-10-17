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

 
//Used for some default values and internal functions
require_once (WB_PATH.'/framework/functions.php');

if (!function_exists('getMiniGalleryImages')) {
	function getMiniGalleryImages($basedir,$dir) {
		$retval = array();
		if(substr($dir, -1) != "/")  $dir .= "/";
		$fulldir = $basedir.''.$dir;
		$d = @dir($fulldir) or die("getImages: Failed opening directory $fulldir for reading");
		while(false !== ($entry = $d->read())) {
		  if($entry[0] == ".") continue;
		  if(isImageFile($fulldir.$entry)) {
			$retval[] = array( "file" => ''.$dir.$entry );
		  }
		}
		$d->close();
		asort($retval);
		return $retval;
	}
}

if (!function_exists('getMiniGalleryImageList')) {
	function getMiniGalleryImageList($basedir,$curdir,$baseurl,$sid) {
		$images = getMiniGalleryImages($basedir,$curdir); 
		$imglist = '';
		if($images) {
			foreach($images as $img) { 
				$imglist .= '<span class="imgholder"><img class="mgthumb" src="'.$baseurl.$curdir.'thumbs/'.basename($img['file']).'" alt="'.$baseurl.$curdir.basename($img['file']).'" title="'.$baseurl.$curdir.basename($img['file']).'"><img class="delete del-'.$sid.'" data-filename="'.basename($img['file']).'" src="'.WB_URL.'/modules/minigal2/delete.png" /></span>'; 
			} 
		}
		return $imglist;	
	}
}

if (!function_exists('minigallery_resize_image')) {
	function minigallery_resize_image( $source, $output_file, $size, $crop ,$force_thumb = false) {
		if(!$source) return;
		minigallery_image_fix_orientation($source);
		$info = getimagesize($source);
		list($orig_w, $orig_h) = $info;
		$src_x = 0;
		$src_y = 0;

		if(!$crop) {
			
			if ($orig_w < $size && $orig_h < $size ) { 
				if(!$force_thumb) return false;  //Image smaller than resize size. Thumbs should still be created
				$crop_w = $size;
				$crop_h = $size;	
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
				
			if ($orig_w < $size && $orig_h < $size ) { 
				if(!$force_thumb) return false;  //Image smaller than resize size. Thumbs should still be created
			}
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

		switch ( $info[2] ) {
		  case IMAGETYPE_GIF:
			$image = imagecreatefromgif($source);
		  break;
		  case IMAGETYPE_JPEG:
			$image = imagecreatefromjpeg($source);
		  break;
		  case IMAGETYPE_PNG:
			$image = imagecreatefrompng($source);
		  break;
		  default:
			return false;
		}

		$dest_img = imagecreatetruecolor($new_w,$new_h);
		   
		if ( ($info[2] == IMAGETYPE_GIF) || ($info[2] == IMAGETYPE_PNG) ) {
		  $trnprt_indx = imagecolortransparent($image);
		  if ($trnprt_indx >= 0) {
			$trnprt_color    = imagecolorsforindex($image, $trnprt_indx);
			$trnprt_indx    = imagecolorallocate($dest_img, $trnprt_color['red'], $trnprt_color['green'], $trnprt_color['blue']);
			imagefill($dest_img, 0, 0, $trnprt_indx);
			imagecolortransparent($dest_img, $trnprt_indx);
		  }
		  elseif ($info[2] == IMAGETYPE_PNG) {
			imagealphablending($dest_img, false);
			$color = imagecolorallocatealpha($dest_img, 0, 0, 0, 127);
			imagefill($dest_img, 0, 0, $color);
			imagesavealpha($dest_img, true);
		  }
		}

		imagecopyresampled($dest_img, $image, 0 , 0 , $src_x, $src_y, $crop_w, $crop_h, $orig_w, $orig_h); 

		switch ( $info[2] ) {
		  case IMAGETYPE_GIF:
			imagegif($dest_img, $output_file);
		  break;
		  case IMAGETYPE_JPEG:
			imagejpeg($dest_img, $output_file,90);
		  break;
		  case IMAGETYPE_PNG:
			imagepng($dest_img, $output_file);
		  break;
		  default:
			return false;
		}

		return true;
	  }
}

if (!function_exists('isImageFile')) {
	function isImageFile($filename) {
		if(@!is_array(getimagesize($filename))){
			return false;
		}
		return true;
	}
}

if (!function_exists('minigallery_image_fix_orientation')) {
	function minigallery_image_fix_orientation($filename) {
		$exif = @exif_read_data($filename);
		if (!empty($exif['Orientation'])) {
			$image = imagecreatefromjpeg($filename);
			switch ($exif['Orientation']) {
				case 3:
					$image = imagerotate($image, 180, 0);
					break;

				case 6:
					$image = imagerotate($image, -90, 0);
					break;

				case 8:
					$image = imagerotate($image, 90, 0);
					break;
			}

			imagejpeg($image, $filename, 90);
		}
	}
}

if (!function_exists('minigallery_save_upload')) {
	function minigallery_save_upload ($fieldname, $resize = 0, $thumbsize = 0, $ratio, $pathToFolder, $thumbFolder, $overwrite = false, &$message) {
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
}
if (!function_exists('minigallery_get_upload_limit')) {
	function minigallery_get_upload_limit() {
		$max_upload = (int)(ini_get('upload_max_filesize'));
		$max_post = (int)(ini_get('post_max_size'));
		$memory_limit = (int)(ini_get('memory_limit'));
		$upload_mb = min($max_upload, $max_post, $memory_limit);
		return $upload_mb;
	}
}