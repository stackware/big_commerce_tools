<?php declare(strict_types=1);
use stackware\bigc;

use function stackware\bigc\debug_array;

use stackware\bigc\creds;
use stackware\bigc\bigc_api;

require('include/header.inc');

define('_DEBUG',true);


abstract class creds_src extends creds
{
    public static string $url = 'https://api.bigcommerce.com/stores/e3bf3/v3/';
    public static string $client_id = '';
    public static string $client_secret = '';
    public static string $access_token = '';
}




$bigc = new bigc_api('creds_src');

// $m = $bigc->list_product_modifiers(81);

$p = $bigc->list_products();

echo debug_array($p);
// echo debug_array($bigc->list_product_modifiers(81));

// foreach( $bigc->list_products() as $k => $v )
// {
//     var_dump($k);
//     var_dump($v);
// }

