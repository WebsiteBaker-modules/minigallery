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
 
// Note: use the $class or $rel variables to build the selector 

if(!defined('MG2_SCRIPTS_ADDED')) {
?> 
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/js/lightcase.js"></script>
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/vendor/jQuery/jquery.events.touch.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/css/lightcase.css" media="screen" />
 <?php } ?>
<script type="text/javascript">
jQuery(document).ready(function($) {
	$('a.sec-<?php echo $section_id ?>[data-rel^=lightcase]').lightcase({
		swipe: true,
		transition: '<?php echo ($transition) ?>',
		speedIn: 500,
		speedOut: 500,
		maxWidth: 2000,
		maxHeight: 1200,
		shrinkFactor: 0.9,
		fullscreenModeForMobile: true,
		timeout: <?php echo ($interval * 1000) ?>, 
		showSequenceInfo: false,
		showTitle: false
	});
});
</script>