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
 
 
// Note: use the $class or $rel variables to build the selector 
// jQuery will be loaded if not already defined in the template header
?> 
<script>
!window.jQuery && document.write('<script type="text/javascript" src="http:\/\/ajax.googleapis.com\/ajax\/libs\/jquery\/1\/jquery.min.js"><\/script>');
</script>
<script type="text/javascript" src="<?php echo WB_URL ?>/modules/minigallery/fancybox/jquery.fancybox-1.3.4.pack.js"></script>
<link rel="stylesheet" type="text/css" href="<?php echo WB_URL ?>/modules/minigallery/fancybox/jquery.fancybox-1.3.4.css" media="screen" />
<script type="text/javascript">
$(document).ready(function() {
	$("a.<?php echo $class ?>").fancybox({padding:0,overlayColor:'#000',overlayOpacity:0.8});
});
</script>