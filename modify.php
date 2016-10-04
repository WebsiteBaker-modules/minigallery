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

if(defined('WB_PATH') == false) { exit("Cannot access this file directly"); }
$basedir = WB_PATH.MEDIA_DIRECTORY.'/minigal2/';
$baseurl = WB_URL.MEDIA_DIRECTORY.'/minigal2/';
require_once ('functions.php');
if(!file_exists(WB_PATH.'/modules/minigal2/languages/'.LANGUAGE.'.php')) {
	require_once(WB_PATH.'/modules/minigal2/languages/EN.php');
} else {
	require_once(WB_PATH.'/modules/minigal2/languages/'.LANGUAGE.'.php');
}

// Setup template object
$template = new Template(WB_PATH.'/modules/minigal2');
$template->set_file('page', 'modify.htt');
$template->set_block('page', 'main_block', 'main');

// Get page content
$query = "SELECT * FROM ".TABLE_PREFIX."mod_minigal2 WHERE section_id = '$section_id'";
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

$interval = $settings['interval'];
$autoplay = $settings['autoplay'];
$transition = $settings['transition'];

//build images
$imglist = '';
$curdir = $section_id."/";
$images = getMiniGalleryImages($basedir,$curdir); 
if($images) {
	foreach($images as $img) { 
		$imglist .= '<img style="margin:03px;" src="'.$baseurl.$curdir.'thumbs/'.basename($img['file']).'" alt="'.$baseurl.$curdir.basename($img['file']).'" title="'.$baseurl.$curdir.basename($img['file']).'">'; 
	} 
}

$tr = array('none', 'fade', 'fadeInline', 'elastic', 'scrollTop', 'scrollRight', 'scrollBottom', 'scrollLeft', 'scrollHorizontal','scrollVertical');
$trselect = '<select name="transition">';
foreach ($tr as $t) {
	$selected = $t == $transition ? " selected='selected'": '';
	$trselect .= '<option value="'.$t.'"'.$selected.'>'.$t.'</option>';
}
$trselect .= '</select>';


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
								'TRANSITION' => $trselect,
								'AUTOPLAY' => $autoplay?"checked='checked'":"",
								'INTERVAL' => $interval,
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
								'IMAGES' => $imglist,
								'LIGHTCASE' => $MG['LIGHTCASE'],
								'LIGHTCASESUB' => $MG['LIGHTCASESUB'],
								'TEXT_TRANSITION' => $MG['TRANSITION'],
								'HELP_TRANSITION' => $MG['HELP_TRANSITION'],
								'TEXT_AUTOPLAY' => $MG['AUTOPLAY'],
								'HELP_AUTOPLAY' => $MG['HELP_AUTOPLAY'],
								'TEXT_AUTOPLAY_INT' => $MG['AUTOPLAY_INT'],
								'HELP_AUTOPLAY_INT' => $MG['HELP_AUTOPLAY_INT'],

								)
						);

// Parse template object
$template->parse('main', 'main_block', false);
$template->pparse('output', 'page');

?>