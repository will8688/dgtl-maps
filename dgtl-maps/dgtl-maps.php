<?php 

/**

Plugin Name: [dgtl] Maps

Version: 1.0

Author: Will Morrison

Description: Adds ability to enter add a map.

*/





register_activation_hook( __FILE__, 'dgtl-maps');



global $current_user, $current_user_meta,$userpro,$get_child_theme_directory;

global $get_child_theme_uri; 

$get_child_theme_uri =  get_stylesheet_directory_uri();

$get_child_theme_directory =  get_stylesheet_directory();



add_action("wp", "dgtl_the_content_register", 9999);

function dgtl_the_content_register() {

    add_filter("the_content", "dgtl_content");

}

 

function dgtl_content($content) 

{

    wp_enqueue_script("maps-dgtl-google-jsapi", "http://www.google.com/jsapi");

	wp_enqueue_script("maps-dgtl-google", "http://maps.google.com/maps/api/js?sensor=false&libraries=geometry,places&v=3.7");

   

    wp_enqueue_style("maps-dgtl-css", plugins_url()."/dgtl-maps/css/style.css");

	wp_enqueue_script("maps-dgtl-map", plugins_url()."/dgtl-maps/js/map.js");

	

    return $content;

}

add_action( 'wp_enqueue_scripts', 'dgtl_content' );



/**
 * Get Google Lat-Lng from Address String
 */
function dgtl_get_latlng_from_address($address) {
	if ( defined('WP_PROXY_HOST')  && WP_PROXY_HOST ) {
		$aContext = array(
			'http' => array(
					'proxy' => 'tcp://'.WP_PROXY_HOST.':'.WP_PROXY_PORT,
					'request_fulluri' => true,
			),
		);
		$cxContext = stream_context_create($aContext);
	} else {
		$cxContext = stream_context_create();
	}

	$url = 'http://maps.googleapis.com/maps/api/geocode/json?address=' . urlencode($address) . '&sensor=false';

	$data = json_decode(file_get_contents($url, FALSE, $cxContext));
	$result = $data->results;
	
	$itude = new stdClass();
	$itude->lat = 0;
	$itude->lng = 0;
	
	if ( count($result) > 0 ) { 
		$itude->lat = $result[0]->geometry->location->lat;
		$itude->lng = $result[0]->geometry->location->lng;
	}
	
	return $itude;
}


function get_google_map() {

	global $post, $wpdb, $current_user, $current_user_meta, $userpro;
	$current_lat		= $_POST['current_lat'];
	$current_lng		= $_POST['current_lng'];
	$timezone			= $_POST['timezone'];
	$packageID			= $_POST['packageid'];
	$show				= $_POST['show'];
	$categories			= $_POST['categories'];

	if ( $current_lat != 0 && $current_lng != 0 ) {
		//fusion_haulageapp_update_my_location($current_lat, $current_lng);
	}	
	$my_query = new WP_Query('category_name=travels&posts_per_page=-1');
	while ( $my_query->have_posts() ) : $my_query->the_post();
	
	$term_list = wp_get_post_terms($post->ID);
	
	$pin_type = 'holiday';
	$location = get_post_meta($post->ID, 'Location', true);
	$placeid = get_post_meta($post->ID, 'placeid', true);

	if ( get_post_meta($post->ID, 'latlng', true) !== "") {
		$latlng = get_post_meta($post->ID, 'latlng', true);
	}
	else{
		$latlng = dgtl_get_latlng_from_address( get_post_meta($location));
		update_post_meta($post->ID, 'latlng', $latlng);		
	}
	
	

	$pin_location[] = array(
							"id"		=> $post->ID,
							"lat"		=> $latlng->lat,
							"lng"		=> $latlng->lng,
							"address"	=> $location,
							"title"		=> get_the_title(),
							"place_id"	=> $placeid,
							"pin_type"	=> $pin_type,
					);

	endwhile;
	echo json_encode($pin_location);
	exit;
}
add_action('wp_ajax_get_google_map', 'get_google_map');
add_action('wp_ajax_nopriv_get_google_map', 'get_google_map');


function update_lat_lng() {
	global $post, $wpdb, $current_user, $current_user_meta, $userpro;

	$postid		= $_POST['postid'];

	$arrlatlng = trim($_POST['latlng'], '()');
	$arrlatlng  = explode(",", $arrlatlng);
	//print_r($postid);
	//print_r($arrlatlng);
	$latlng = new stdClass();
	$latlng->lat = $arrlatlng[0];
	$latlng->lng = $arrlatlng[1];
	update_post_meta($postid, 'latlng', $latlng);	
	exit;
}
add_action('wp_ajax_update_lat_lng', 'update_lat_lng');
add_action('wp_ajax_nopriv_update_lat_lng', 'update_lat_lng');





/**

 * Get Google Address from Lat-Lng

 */

function fusion_haulageapp_get_address_from_latlng($lat, $lng, $show_type="address") {

	if ( defined('WP_PROXY_HOST')  && WP_PROXY_HOST ) {

		$aContext = array(

			'http' => array(

					'proxy' => 'tcp://'.WP_PROXY_HOST.':'.WP_PROXY_PORT,

					'request_fulluri' => true,

			),

		);

		$cxContext = stream_context_create($aContext);

	} else {

		$cxContext = stream_context_create();

	}



	$url = 'http://maps.googleapis.com/maps/api/geocode/json?latlng='.$lat.','.$lng.'&sensor=false';



	$data = json_decode(file_get_contents($url, FALSE, $cxContext));

	

	$result = $data->results;

	

	$address = "";

	

	if ( count($result) > 0 ) {

		$_address = new stdClass();

		for ( $i = 0; $i < count($result[0]->address_components); $i ++ ) {

			$_address->{$result[0]->address_components[$i]->types[0]} = $result[0]->address_components[$i]->short_name; 

		}

		

		if ( $show_type == 'city' ) {

			$address = $_address->locality.", ".$_address->administrative_area_level_1;

		} else {

			$address = $result[0]->formatted_address;

		}

	}

	

	return $address;

}



 

function get_info_box() {

	global $wpdb, $current_user, $get_child_theme_uri, $resume; 

	$user_id = $_POST["user_id"];

	$id = $_POST["id"];

	$pin_type = $_POST["pin_type"];

	

if ($pin_type == 'resumes') {

	$view = Wpjb_Project::getInstance()->getApplication('resumes')->getView();

	echo '<div class="wpjb wpjr-page-resume" >';			

		$resume = new Wpjb_Model_Resume($id);		

        $view->resume = $resume;

        $view->render("index-item.php");     															

echo '</div>';

}

else if ($pin_type == 'jobs') {

	$view = Wpjb_Project::getInstance()->getApplication("frontend")->getView();

	echo '<div class="wpjb wpjr-page-jobs" >';			

		$job = new Wpjb_Model_Job($id);		

        $view->job = $job;

        $view->render("index-item.php");     															

echo '</div>';

}





exit;

}

add_action('wp_ajax_get_info_box', 'get_info_box');

add_action('wp_ajax_nopriv_get_info_box', 'get_info_box');



add_shortcode( 'dgtl_map', 'dgtl_map' );

function dgtl_map ($atts = array()) {

			

$params = shortcode_atts(array(

        "show" => "",

		"categories" => ""		

    ), $atts);

    

    foreach((array)$atts as $k=>$v) {

        if(stripos($k, "meta__") === 0) {

            $params["meta"][substr($k, 6)] = $v;

        }

    } 



		$render =  "<div id='map_canvas'></div>";

		$render .= "<div class='pin_info'></div>";

		$render .= "<script>";

		$render .= "var ajax_url = '". admin_url('admin-ajax.php'). "';";

        $render .= "var plugins_url = '". plugins_url() . "/dgtl-maps/';";	

		$render .= "var show = '". $params["show"] . "';";

		$render .= "var categories = '". $params["categories"] . "';";		

		$render .= "</script>";

		return $render;

}

add_shortcode( 'dgtl_map_filter', 'dgtl_map_filter' );

function dgtl_map_filter()

{

	global $wpdb;

	$select = Daq_Db_Query::create();

    $select->from("Wpjb_Model_Tag t");

    $select->where("type = ?", Wpjb_Model_Tag::TYPE_CATEGORY);

    $select->order("title ASC");

    $list = $select->execute();

    $arr = array();

	

    $render =  "<div class='dgtl_map_filter' style='background-color:#fff;'>";

    foreach($list as $item) {        

		$render .=   "<input checked='checked' type='checkbox' data='".$item->title."'  id='yh-filter-".$item->title."' title='yh-filter-".$item->title."' />" . $item->title ." <br>";	

    }

 	$render .=  "</div>";

	

	return $render;	

}

?>





