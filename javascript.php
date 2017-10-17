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
 
// Note: use the $class or $rel variables to build the selector 

if(!defined('MG2_SCRIPTS_ADDED')) {
if ($ratio == '0') { // load justify plugin
?>
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/justified/js/jquery.justifiedGallery.min.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo WB_URL ?>/modules/minigal2/justified/css/justifiedGallery.min.css" media="screen" />
<?php 
}
?> 
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/js/lightcase.js"></script>
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigal2/lightcase/vendor/jQuery/jquery.events.touch.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo WB_URL ?>/modules/minigal2/lightcase/src/css/lightcase.css" media="screen" />
 <?php } ?>
<script type="text/javascript">
jQuery(document).ready(function($) {
	<?php if ($ratio == '0') { ?>
	$("#mg<?php echo $section_id ?>").justifiedGallery({
		rowHeight : <?php echo $thumbsize / 1.6 ?>,
		maxRowHeight : <?php echo $thumbsize  ?>,
		lastRow : 'nojustify',
		margins : 4,
		waitThumbnailsLoad : false
	});
	<?php } ?>
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