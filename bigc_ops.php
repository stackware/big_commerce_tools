<?php


class bigc_ops
{
    public string $run_ts = '';

    public string $product_dir = '/products/';
    public string $img_dir = '/images/';

    public array $creds_source = [];
    public array $creds_dest = [];

    public $ctxt_src = null;
    public $ctxt_dest = null;

    
    
//    (empty($url) || empty($client_id) || empty($client_secret) || empty($access_token))
    
    public function __construct( public bool $live = false )
    {
        $this->run_ts = date('Y-m-d_H-i-s');

        if( empty($this->creds_source) || empty($this->creds_source['api_url']) )
            throw new Exception('Source credentials needed.');

        if( $live && (empty($this->creds_dest) || empty($this->creds_dest['api_url'])) )
            throw new Exception("Trying LIVE without destination credentials");

        $this->ctxt_src = $this->new_context($this->creds_source);

        if( $live )
            $this->ctxt_dest = $this->new_context($this->creds_dest);
    }

    public function download_image($image_url, $product_id, $download_dir)
    {
        if( !is_writeable($this->img_dir) )
        {
            if( !mkdir($this->img_dir, 0777, true) )
                throw new Exception("Couldn't create image storage $this->img_dir");
        }


        $image_path = $download_dir . "/{$product_id}/";
        var_dump($image_path);
        return;
        if (!file_exists($image_path)) {
        }

        $image_data = file_get_contents($image_url);
        $image_name = basename($image_url);
        $image_full_path = $image_path . $image_name;

        file_put_contents($image_full_path, $image_data);

        return $image_full_path;
    }

    public function save_to_json($data, $filename)
    {
        file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT));
    }

    public function list_products( $ctxt,$with_images = false )
    {
        $products = $this->api_call("catalog/products",$ctxt==='d'?$this->ctxt_dest:$this->ctxt_src);

        $r_products = [];
        foreach( $products['data'] as $p )
        {
            echo "\nPRODUCT ID: {$p['id']} \n";
            var_dump($p);

            if ($with_images)
            {
                $images = $this->api_call("catalog/ps/{$p['id']}/images",$this->ctxt_src);

                foreach ($images['data'] as $image)
                {
                    echo "\n  - Image: {$image['url_standard']}";
                }
            }
        }
    }

    public function download_products($with_images = false)
    {

        $download_dir = __DIR__ . "/products_{$this->run_ts}";

        if (!mkdir($download_dir, 0777, true)) {
            throw new Exception("Failed to create directory $download_dir");
        }

        $products = $this->api_call("catalog/products");

        foreach ($products['data'] as $product) {
            $product_file = $download_dir . "/{$product['id']}.json";
            $this->save_to_json($product, $product_file);

            if ($with_images) {
                $images = $this->api_call("catalog/products/{$product['id']}/images");
                foreach ($images['data'] as $image) {
                    $this->download_image($image['url_standard'], $product['id'], $download_dir);
                }
            }
        }
    }

    public function list_price_lists()
    {
        $price_lists = $this->api_call("pricelists");

        foreach ($price_lists['data'] as $list) {
            echo "\nPrice List: {$list['name']}, ID: {$list['id']}";
        }
    }

    public function download_price_lists()
    {
        $timestamp = date('Y-m-d_H-i-s');
        $download_dir = __DIR__ . "/pricelists_{$timestamp}";
        if (!mkdir($download_dir, 0777, true)) {
            throw new Exception("Failed to create directory $download_dir");
        }

        $price_lists = $this->api_call("pricelists");

        foreach ($price_lists['data'] as $list) {
            $list_file = $download_dir . "/{$list['name']}.json";
            $this->save_to_json($list, $list_file);
        }
    }
}



$operation = $command_args[0] ?? null;
$entity = $command_args[1] ?? null;
$with_images = in_array('with-images', $command_args);


$destination = [
    'api_url' => '',
    'client_id' => '',
    'client_secret' => '',
    'access_token' => ''
];


class thisbigc extends bigc_ops
{    
    // aalp prod
    public array $creds_source = [
        'api_url' => '',
        'client_id' => '',
        'client_secret' => '',
        'access_token' => ''
    ];

    public function __construct( $live = false )
    {
        parent::__construct($live);
    }
}


$bigc_client = new thisbigc(false);


if( $entity === 'products' )
{
    $r_p = $bigc_client->list_products('s',$with_images);

}
else
    exit("Unknown entity '$entity'");


// // Command Dispatcher
// if ($operation === 'list' && $entity === 'products') {

// } elseif ($operation === 'download' && $entity === 'products') {
// } elseif ($operation === 'list' && $entity === 'price_lists') {
//     $bigc_client->list_price_lists();
// } elseif ($operation === 'download' && $entity === 'price_lists') {
//     $bigc_client->download_price_lists();
// } else {
//     echo "Invalid command. Usage: bigc_ops.php [list|download] [products|price_lists] [with-images]\n";
// }


