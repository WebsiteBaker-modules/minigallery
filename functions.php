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

 
//Used for some default values and internal functions
require_once (WB_PATH.'/framework/functions.php');

if (!function_exists('getMiniGalleryImages')) {
	function getMiniGalleryImages($basedir,$dir, $section_id,$sorting=null) {
		$retval = array();
		if(substr($dir, -1) != "/")  $dir .= "/";
		$fulldir = $basedir.''.$dir;
		$d = @dir($fulldir) or die("getImages: Failed opening directory $fulldir for reading");
		while(false !== ($entry = $d->read())) {
		  if($entry[0] == ".") continue;
		  if(isImageFile($fulldir.$entry)) {
		    $caption = minigallery_get_caption($entry, $section_id);
			$retval[] = array( "file" => ''.$dir.$entry, "caption" => $caption );
		  }
		}
		$d->close();
		minigallery_array_sort_by('file',$retval);
		if($sorting) {
			$sarray = explode('|',$sorting);
			$first = array();
			foreach($sarray as $element) {
				foreach($retval as $key => $value) {
					if($value['file'] == $dir.$element) {
						$first[] = $value;
						unset($retval[$key]);
						continue;
					}	 
				} 
			}
			$retval = array_merge($first,$retval);
		}
		return $retval;
	}
}

if (!function_exists('getMiniGalleryImageList')) {
	function getMiniGalleryImageList($basedir,$curdir,$baseurl,$sid) {
		global $database;
		$get_settings = $database->query("SELECT * FROM ".TABLE_PREFIX."mod_minigal2 WHERE section_id = '$sid'");
		$settings = $get_settings->fetchRow();
		$thumbsize = $settings['thumbsize'];
		$thumbheight = $thumbsize;
		$ratio = $settings['ratio'];
		if(!$ratio) {
			$thumbsize = 100000; // set width to high value, we want only the height
		}
		$sorting = $settings['sorting'];
		$images = getMiniGalleryImages($basedir,$curdir,$sid,$sorting); 
		$imglist = '<div id="sortable-'.$sid.'">';
		if($images) {
			foreach($images as $img) { 
				if (!file_exists($basedir.$curdir.'thumbs/'.basename($img['file']))) {
					minigallery_resize_image ( $basedir.$curdir.basename($img['file']), $basedir.$curdir.'thumbs/'.basename($img['file']) , $thumbsize, $thumbheight, $ratio, true);
				}
				$imglist .= '<span data-id="'.basename($img['file']).'" class="imgholder"><img class="mgthumb" src="'.$baseurl.$curdir.'thumbs/'.basename($img['file']).'?t='.time().'" alt="'.$baseurl.$curdir.basename($img['file']).'" title="'.$img['caption'].'">
				<img class="edit edit-'.$sid.'" data-caption="'.htmlentities($img['caption']).'" data-filename="'.basename($img['file']).'" src="'.WB_URL.'/modules/minigal2/edit.png" />
				<img class="delete del-'.$sid.'" data-filename="'.basename($img['file']).'" src="'.WB_URL.'/modules/minigal2/delete.png" />
				</span>'; 
			} 
		}
		$imglist .= "</div>
		<script>
			var el = document.getElementById('sortable-$sid');
			var sortable = Sortable.create(el,{
			 animation: 150,
			 onSort: function (e) {
					var items = e.to.children;
					var result = [];
					for (var i = 0; i < items.length; i++) {
						result.push($(items[i]).data('id'));
					}
					$.ajax({url:'".WB_URL."/modules/minigal2/ajax.php',type: 'POST',data : {section_id:'$sid',function:'sort',arr : result}});
				}
			});
		</script>";
		return $imglist;	
	}
}

if (!function_exists('minigallery_resize_image')) {
	function minigallery_resize_image( $source, $output_file, $size, $height, $crop ,$force_thumb = false) {
		ini_set('memory_limit', '512M');
		if(!$source) return;
		minigallery_image_fix_orientation($source);
		$info = getimagesize($source);
		list($orig_w, $orig_h) = $info;
		$src_x = 0;
		$src_y = 0;

		if(!$crop) {
			
			if ($orig_w < $size && $orig_h < $height ) { 
				if(!$force_thumb) return false;  //Image smaller than resize size. Thumbs should still be created
				$crop_w = $size;
				$crop_h = $height;	
			}
			
			$crop_w = $size;
			$crop_h = $orig_h*($size/$orig_w);
			
			if($crop_h > $height) {
				$crop_w = $orig_w*($height/$orig_h);
				$crop_h = $height;			
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
		imagedestroy($image);
		
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
		imagedestroy($dest_img);
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
			imagedestroy($image);
		}
	}
}

if (!function_exists('minigallery_save_upload')) {
	function minigallery_save_upload ($fieldname, $resize = 0, $maxheight = 0 , $thumbsize = 0, $thumbheight = 0, $ratio, $pathToFolder, $thumbFolder, $overwrite = false, &$message) {
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
					minigallery_resize_image( $new_filename, $new_filename, $resize, $maxheight, 0);
					minigallery_resize_image( $new_filename, $thumb_filename, $thumbsize, $thumbheight, $ratio, true);
					return true;
				}
			}
		}
		return false;
	}
}
if (!function_exists('minigallery_save_caption')) {
	function minigallery_save_caption ($section_id, $filename, $caption ) {
		global $database;
		if($database->get_one("SELECT `image` FROM ".TABLE_PREFIX."mod_minigal2img WHERE `image`='$filename' AND `section_id`='$section_id'")) {
		//update
			$query = "UPDATE ".TABLE_PREFIX."mod_minigal2img SET `title`='$caption' WHERE `image`='$filename' AND `section_id`='$section_id'";
		} else { 
		// insert
			$query = "INSERT INTO ".TABLE_PREFIX."mod_minigal2img SET 
				`section_id`='$section_id',
				`image`='$filename',
				`title`='$caption'";
		}
		//die($query);
		$database->query($query);
	}
}
if (!function_exists('minigallery_save_sorting')) {
	function minigallery_save_sorting ($section_id, $sorting ) {
		global $database;
		$query = "UPDATE ".TABLE_PREFIX."mod_minigal2 SET `sorting`='$sorting' WHERE `section_id`='$section_id'";
		$database->query($query);
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

if (!function_exists('minigallery_array_sort_by')) {
	function minigallery_array_sort_by($key, array &$array) {
		return usort($array, function($x, $y) use ($key) {
			//return strnatcasecmp($x[$key] ?? null, $y[$key] ?? null);
			return strnatcasecmp($x[$key], $y[$key]);
		});
	}
}


if (!function_exists('minigallery_get_caption')) {
	function minigallery_get_caption($filename, $section_id) {
		global $database;
		//die("SELECT `title` FROM ".TABLE_PREFIX."mod_minigal2img WHERE `section_id`='$section_id' AND `image`='$filename'");
		if($caption = $database->get_one("SELECT `title` FROM ".TABLE_PREFIX."mod_minigal2img WHERE `section_id`='$section_id' AND `image`='$filename'")) {
			return $caption;
		}
		return '';
		
		$info = pathinfo($filename);
		$caption = basename($filename,'.'.$info['extension']);
		$caption = str_replace(array('.','#','-','_','^'),' ',$caption);
		$caption = str_replace(array('1','2','3','4','5','6','7','8','9','0'),'',$caption);
		$caption = ucwords($caption);
		return $caption;
	}
}

if (!function_exists('minigallery_create_dir')) {
	function minigallery_create_dir($section_id) {
		require(dirname(__FILE__).'/info.php');
		$basedir = WB_PATH.MEDIA_DIRECTORY.'/'.$image_path.'/';
		$pathToFolder = $basedir.$section_id.'/';
		$thumbFolder = $pathToFolder.'thumbs/';
		make_dir($basedir);
		make_dir($pathToFolder);
		make_dir($thumbFolder);
	}
}
