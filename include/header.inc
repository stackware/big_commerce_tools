<?php declare(strict_types=1);
namespace stackware\bigc;

use \Exception;


define('RUN_TS',(string)time());


// if (empty($command_args)) {
//     echo "No commands provided. Usage: bigc_ops.php [list|download] [products|price_lists] [with-images]\n";
//     exit(1);
// }

function debug_array(array $arr, $label = '', $indent = 0, $skip = 'meta' )
{
    $indent = 1 + $indent;
    $buf = "\n\n=== ".count($arr)." items";
    if( empty($label) )
        $buf .= " in ROOT";
    else
        $buf .= " in $label";

    foreach ($arr as $k => $v) {
        $indentation = str_repeat(' ', $indent * 2); // 4 spaces for each indentation level
        if( $k === $skip )
        {
            echo "\nskipped $skip";
            continue;            
        }

        if (is_array($v)) {
            $buf .= "\n" . $indentation . "$k:";
            $buf .= debug_array($v, $k, $indent + 1); // increase indentation level for nested arrays
        } else {
            $buf .= "\n" . $indentation . "$k: $v";
        }
    }

    return "\n".$buf;
}

abstract class creds
{
    public static string $url = '';
    public static string $client_id = '';
    public static string $client_secret = '';
    public static string $access_token = '';
}

class bigc_api
{
    public string $run_ts = '';

    public array $creds = [];
    public $ctxt = null;

    
    
//    (empty($url) || empty($client_id) || empty($client_secret) || empty($access_token))
    
    public function __construct( string $creds )
    {
        $this->run_ts = RUN_TS;
        
        $this->creds = get_class_vars($creds);


        if( empty($creds::$url) || empty($creds::$client_id) || empty($creds::$client_secret) || empty($creds::$access_token) )
            throw new Exception("Check credentials");


        if( substr($this->creds['url'],-1) !== '/' )
            $this->creds['url'] .= '/';

        $this->ctxt = $this->new_context($this->creds);
    }

    public function new_context( array $creds )
    {
        $opts = [
            "http" => [
                "header" => "X-Auth-Token: {$creds['access_token']}\r\nAccept: application/json\r\n"
            ]
        ];

        $context = stream_context_create($opts);

        if( $context )
            echo "\n\nConnected.";
        else
            throw new Exception("Couldn't connect: ". implode(' | ',$creds));

        return $context;
    }


    public function api_get( $endpoint )
    {
        $response = file_get_contents($this->creds['url'].$endpoint,false,$this->ctxt);

        if ($response === false)
            throw new Exception("Failed to fetch data from API URL for endpoint: ".($this->creds['url'].$endpoint));

        return json_decode($response, true);
    }


    public function list_products( $page = null )
    {
        return $this->api_get('catalog/products');
    }

    // https://api.bigcommerce.com/stores/[store_hash]/v3/catalog/products/[product_id]/modifiers
    public function list_product_modifiers( $product_id )
    {
        $r = $this->api_get("catalog/products/{$product_id}/modifiers");

        return $r;
    }

}

