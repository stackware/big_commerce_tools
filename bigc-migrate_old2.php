<?php

// Check if required extensions are loaded
if (!extension_loaded('curl')) {
    die("cURL extension is required.\n");
}



if (!extension_loaded('curl')) {
    die("cURL extension is required.\n");
}

// Configuration
$sourceStore = [
    'api_url' => 'https://api.bigcommerce.com/stores/YOUR_SOURCE_STORE_HASH/',
    'client_id' => 'YOUR_CLIENT_ID',
    'access_token' => 'YOUR_ACCESS_TOKEN',
];

// Function to make API requests
function makeApiRequest($url, $token, $method = 'GET', $data = null) {
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'X-Auth-Client: ' . $GLOBALS['sourceStore']['client_id'],
        'X-Auth-Token: ' . $token,
        'Accept: application/json',
    ]);

    if ($method === 'POST' && $data) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge(
            [
                'Content-Type: application/json',
            ],
            curl_getinfo($ch, CURLINFO_HEADER_OUT)
        ));
    }

    $response = curl_exec($ch);
    curl_close($ch);

    return json_decode($response, true);
}

// Function to determine API version
function getApiVersion($source) {
    $url = $source['api_url'] . 'v3/';
    $response = makeApiRequest($url, $source['access_token']);
    
    if (isset($response['data']['api_version'])) {
        return $response['data']['api_version'];
    }

    return null;
}

// Function to list products
function listProducts($source, $version = 'v3') {
    $url = $version === 'v2' 
        ? $source['api_url'] . 'v2/products' 
        : $source['api_url'] . 'v3/catalog/products';

    $products = makeApiRequest($url, $source['access_token']);

    if (isset($products['data'])) {
        foreach ($products['data'] as $product) {
            echo "Product ID: {$product['id']}, Name: {$product['name']}\n";

            // List variations
            listProductVariations($source, $product['id'], $version);

            // List attributes
            listProductAttributes($source, $product['id'], $version);

            // List images
            listProductImages($source, $product['id'], $version);
        }
    } else {
        echo "No products found or an error occurred.\n";
    }
}

// Function to list product variations
function listProductVariations($source, $productId, $version) {
    $url = $version === 'v2' 
        ? $source['api_url'] . 'v2/products/' . $productId . '/variants' 
        : $source['api_url'] . 'v3/catalog/products/' . $productId . '/variants';

    $variations = makeApiRequest($url, $source['access_token']);

    if (isset($variations['data'])) {
        foreach ($variations['data'] as $variant) {
            echo "  Variation ID: {$variant['id']}, SKU: {$variant['sku']}, Price: {$variant['price']}\n";
        }
    }
}

// Function to list product attributes
function listProductAttributes($source, $productId, $version) {
    $url = $version === 'v2' 
        ? $source['api_url'] . 'v2/products/' . $productId . '/options' 
        : $source['api_url'] . 'v3/catalog/products/' . $productId . '/options';

    $attributes = makeApiRequest($url, $source['access_token']);

    if (isset($attributes['data'])) {
        foreach ($attributes['data'] as $attribute) {
            echo "  Attribute ID: {$attribute['id']}, Name: {$attribute['name']}\n";
        }
    }
}

// Function to list product images
function listProductImages($source, $productId, $version) {
    $url = $version === 'v2' 
        ? $source['api_url'] . 'v2/products/' . $productId . '/images' 
        : $source['api_url'] . 'v3/catalog/products/' . $productId . '/images';

    $images = makeApiRequest($url, $source['access_token']);

    if (isset($images['data'])) {
        foreach ($images['data'] as $image) {
            echo "  Image ID: {$image['id']}, URL: {$image['url']} \n";
        }
    }
}

// Main logic
$options = getopt("", ["product", "live"]);

if (isset($options['product'])) {
    echo "Determining API version...\n";
    $apiVersion = getApiVersion($sourceStore);
    
    if ($apiVersion) {
        echo "API Version: $apiVersion\n";
        
        echo "Listing products from the source store...\n";
        if (isset($options['live'])) {
            echo "Performing live migration...\n";
            // Implement migration logic here
        } else {
            listProducts($sourceStore, 'v3'); // Default to v3
        }
    } else {
        echo "Failed to determine API version.\n";
    }
} else {
    echo "Please provide the --product option to list products.\n";
}

?>
