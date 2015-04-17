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
//Used for some default values and internal functions
require_once (WB_PATH.'/framework/functions.php');

$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigallery/';
$baseurl = WB_URL.MEDIA_DIRECTORY.'/minigallery/';


if (!function_exists('getImages')) {
	function getImages($basedir,$dir) {
		$retval = array();
		$imagetypes = array("image/jpeg", "image/gif");
		if(substr($dir, -1) != "/")  $dir .= "/";
		$fulldir = $basedir.''.$dir;
		$d = @dir($fulldir) or die("getImages: Failed opening directory $fulldir for reading");
		while(false !== ($entry = $d->read())) {
		  if($entry[0] == ".") continue;
		  if(in_array(mime_content_type($fulldir.$entry), $imagetypes)) {
			$retval[] = array( "file" => ''.$dir.$entry );
		  }
		}
		$d->close();
		asort($retval);
		return $retval;
	}
}

