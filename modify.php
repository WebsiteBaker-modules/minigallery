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
if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
require_once ('functions.php');
if(!file_exists(WB_PATH.'/modules/minigallery/languages/'.LANGUAGE.'.php')) {
	require_once(WB_PATH.'/modules/minigallery/languages/EN.php');
} else {
	require_once(WB_PATH.'/modules/minigallery/languages/'.LANGUAGE.'.php');
}

// Setup template object
$template = new Template(WB_PATH.'/modules/minigallery');
$template->set_file('page', 'modify.htt');
$template->set_block('page', 'main_block', 'main');

// Get page content
$query = "SELECT * FROM ".TABLE_PREFIX."mod_minigallery WHERE section_id = '$section_id'";
$get_settings = $database->query($query);
$settings = $get_settings->fetchRow();
$name = ($settings['name']);
$description = ($settings['description']);
$addscripts = ($settings['addscripts']);
$maxsize = ($settings['maxsize']);
$thumbsize = $settings['thumbsize'];
$ratio = $settings['ratio'];
$class = $settings['class'];
$rel = $settings['rel'];

//build images
$imglist = '';
$curdir = $section_id."/";
$images = getImages($basedir,$curdir); 
if($images) {
	foreach($images as $img) { 
		$imglist .= '<img style="margin:03px;" src="'.$baseurl.$curdir.'thumbs/'.basename($img['file']).'" alt="'.$baseurl.$curdir.basename($img['file']).'" title="'.$baseurl.$curdir.basename($img['file']).'">'; 
	} 
}
// Insert vars
$template->set_var(array(
								'PAGE_ID' => $page_id,
								'SECTION_ID' => $section_id,
								'WB_URL' => WB_URL,
								'NAME' => $name,
								'DESCRIPTION' => $description,
								'ADDSCRIPTS' => $addscripts?"checked='checked'":"",
								'MAXSIZE' => $maxsize,
								'THUMBSIZE' => $thumbsize,
								'RATIO' => $ratio?"checked='checked'":"",
								'CLASS' => $class,
								'REL' => $rel,
								'TEXT_SAVE' => $TEXT['SAVE'],
								'TEXT_CANCEL' => $TEXT['CANCEL'],
								'TEXT_MINIGALLERY' => $MG['MINIGALLERY'],
								'TEXT_SETTINGS' => $MG['SETTINGS'],
								'TEXT_UPLOAD' => $MG['UPLOAD'],
								'TEXT_SUBTITLE' => $MG['SUBTITLE'],
								'TEXT_NAME' => $MG['NAME'],
								'TEXT_DESC' => $MG['DESCRIPTION'],
								'TEXT_MAXSIZE' => $MG['MAXSIZE'],
								'TEXT_MAXTHUMB' => $MG['MAXTHUMB'],
								'TEXT_RATIO' => $MG['RATIOTHUMB'],
								'TEXT_ADDCLASS' => $MG['ADDCLASS'],
								'TEXT_ADDREL' => $MG['ADDREL'],
								'TEXT_ADDOUTPUT' => $MG['ADDOUTPUT'],
								'HELP_NAME' => $MG['HELP_NAME'],
								'HELP_DESC' => $MG['HELP_DESCRIPTION'],
								'HELP_MAXSIZE' => $MG['HELP_MAXSIZE'],
								'HELP_MAXTHUMB' => $MG['HELP_MAXTHUMB'],
								'HELP_RATIO' => $MG['HELP_RATIO'],
								'HELP_ADDCLASS' => $MG['HELP_ADDCLASS'],
								'HELP_ADDREL' => $MG['HELP_ADDREL'],
								'HELP_ADDOUTPUT' => $MG['HELP_ADDOUTPUT'],
								'NOTE' => $MG['NOTE'],
								'FILE' => $MG['FILE'],
								'CURRENT' => $MG['CURRENT'],
								'REMOVECUR' => $MG['REMOVECUR'],
								'UPLOADING' => $MG['UPLOADING'],
								'IMAGES' => $imglist
								)
						);

// Parse template object
$template->parse('main', 'main_block', false);
$template->pparse('output', 'page');

?>