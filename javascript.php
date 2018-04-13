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

// Note: use the $class or $rel variables to build the selector 

if($addscripts && !defined('MG2_SCRIPTS_ADDED')) {
	if(!defined('MG2_SCRIPTS_ADDED')) define ('MG2_SCRIPTS_ADDED',true); //Prevent multiple adding of jQuery and lightcase
?> 
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/js/lightcase.js"></script>
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/vendor/jQuery/jquery.events.touch.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/css/lightcase.css" media="screen" />
<?php } ?>
<script type="text/javascript">
jQuery(document).ready(function($) {
	new flexImages({ selector: '#mg<?php echo $section_id ?>', rowHeight: <?php echo $thumbheight ?> });
<?php if ($addscripts) { ?>
	$('a.sec-<?php echo $section_id ?>[data-rel^=lightcase]').lightcase({
		swipe: true,
		transition: '<?php echo ($transition) ?>',
		transitionOpen: 'elastic',
		transitionClose: 'elastic',
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
<?php } ?>
});
</script>