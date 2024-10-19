<?php



$source = [
    'api_url' => '',
    'client_id' => '',
    'client_secret' => '',
    'access_token' => ''
];

$destination = [
'api_url' => '',
'client_id' => '',
'client_secret' => '',
'access_token' => ''
];



// Check for --products and --download-images argument
$options = getopt("", ["products", "download-images::", "live"]);



$live_run = isset($options['live']);
$downloadImagesDir = isset($options['include-images']) ? $options['include-images'] : null;

if (!isset($options['products']) && !$dryRun) {
    echo "Use the --products for now.\n";
    exit(1);
}


class bigc_api
{
    public $context = null;


    public function __construct( public string $url,public string $client_id,public string $client_secret,public string $access_token )
    {
        if( empty($url) || empty($client_id) || empty($client_secret) || empty($access_token) )
            throw new Exception("All parameters need values");

        $this->connect();
    }

    public function connect()
    {
        $opts = [
            "http" => [
                "header" => "X-Auth-Token: $this->access_token\r\nAccept: application/json\r\n"
            ]
        ];

        $this->context = stream_context_create($opts);
        if( $this->context )
            echo "\n\nConnected.";
        else
            throw new Exception("Couldn't connect: ".stream_get_er);

        $response = file_get_contents($url, false, $context);
        return json_decode($response, true);        
    }
}

// Function to download an image using file_get_contents and file_put_contents
function downloadImage($imageUrl, $productId, $downloadImagesDir) {
    $imagePath = $downloadImagesDir . "/{$productId}/";
    
    if (!file_exists($imagePath)) {
        if( !mkdir($imagePath, 0777, true) )
            throw new Exception("Couldn't make output directory $imageUrl");
    }
    
    $imageData = file_get_contents($imageUrl);
    $imageName = basename($imageUrl);
    $imageFullPath = $imagePath . $imageName;

    file_put_contents($imageFullPath, $imageData);

    return $imageFullPath;
}

// Function to list all products and handle images
function listAndHandleProducts($source, $downloadImagesDir, $dryRun = false) {
    $page = 1;
    $limit = 50;
    $allProducts = [];

    do {
        $url = $source['api_url'] . "catalog/products?page=$page&limit=$limit";
        $response = apiCall($url, $source['access_token']);

        if (!empty($response['data'])) {
            $allProducts = array_merge($allProducts, $response['data']);
            $page++;
        } else {
            break;
        }
    } while (count($response['data']) == $limit);

    if (!empty($allProducts)) {
        foreach ($allProducts as $product) {
            echo "Product ID: " . $product['id'] . "\n";
            echo "Name: " . $product['name'] . "\n";
            echo "SKU: " . $product['sku'] . "\n";

            // Dry-run mode - only show what would happen
            if ($dryRun) {
                echo "Dry-run: Would process this product.\n";
            }

            // Get images for the current product
            $imageUrl = $source['api_url'] . "catalog/products/" . $product['id'] . "/images";
            $images = apiCall($imageUrl, $source['access_token']);

            if (!empty($images['data'])) {
                echo "Images:\n";
                foreach ($images['data'] as $image) {
                    echo " - " . basename($image['url_standard']) . "\n";

                    if ($downloadImagesDir) {
                        if ($dryRun) {
                            echo "   Dry-run: Would download this image to $downloadImagesDir.\n";
                        } else {
                            // Download the image if not in dry-run
                            $imagePath = downloadImage($image['url_standard'], $product['id'], $downloadImagesDir);
                            echo "   Image downloaded to: $imagePath\n";
                        }
                    } else {
                        echo "   (Image would be downloaded if --download-images was specified)\n";
                    }
                }
            } else {
                echo " - No images found for this product.\n";
            }

            echo "\n";  // Spacer between products
        }
    } else {
        echo "No products found or an error occurred.\n";
    }
}

// Run product listing and handle image download if requested
if ($dryRun) {
    echo "Running in dry-run mode...\n";
}
listAndHandleProducts($source, $downloadImagesDir, $dryRun);

