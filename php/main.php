<?php
$url = 'http://localhost:3000/send'; // Cambia por la URL de tu API

$data = ['msg' => 'que tal le fue en sus ultimas 3 temporadas'];

$options = [
  'http' => [
    'header'  => "Content-Type: application/json\r\n",
    'method'  => 'POST',
    'content' => json_encode($data),
    'ignore_errors' => true // para capturar errores HTTP también
  ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);

if ($result === FALSE) {
  die('Error al conectar con la API');
}

$response = json_decode($result, true);

if (isset($response['success']) && $response['success']) {
  echo "Respuesta de la IA: " . $response['response'] . PHP_EOL;
} else {
  echo "Error de la API: " . ($response['response'] ?? 'Respuesta inválida') . PHP_EOL;
}
