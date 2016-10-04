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
			imagejpeg($dest_img, $output_file);
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

function minigallery_image_fix_orientation($filename) {
    $exif = exif_read_data($filename);
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