<?php

if (!extension_loaded('curl'))
    die("cURL extension is required.\n");


// Configuration
$sourceStore = [
    'api_url_v2' => 'https://api.bigcommerce.com/stores/YOUR_SOURCE_STORE_HASH/v2/',
    'api_url_v3' => 'https://api.bigcommerce.com/stores/YOUR_SOURCE_STORE_HASH/v3/',
    'client_id' => 'YOUR_CLIENT_ID',
    'access_token' => 'YOUR_ACCESS_TOKEN',
];

// Function to make API requests
function makeApiRequest($url, $token, $version = 'v3', $method = 'GET', $data = null) {
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

// Function to list products
function listProducts($source, $version = 'v3') {
    $url = $version === 'v2' 
        ? $source['api_url_v2'] . 'products' 
        : $source['api_url_v3'] . 'catalog/products';

    $products = makeApiRequest($url, $source['access_token'], $version);

    if (isset($products['data'])) {
        foreach ($products['data'] as $product) {
            echo "Product ID: {$product['id']}, Name: {$product['name']}\n";
        }
    } else {
        echo "No products found or an error occurred.\n";
    }
}

// Main logic
$options = getopt("", ["product", "live"]);

if (isset($options['product'])) {
    echo "Listing products from the source store...\n";
    
    // Check for live migration flag
    if (isset($options['live'])) {
        echo "Performing live migration...\n";
        // Implement migration logic here
    } else {
        listProducts($sourceStore, 'v3'); // Default to v3
    }
} else {
    echo "Please provide the --product option to list products.\n";
}


