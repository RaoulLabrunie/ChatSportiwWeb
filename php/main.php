<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit();
}

// Verificar que sea una petición POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'response' => 'Método no permitido']);
  exit();
}

try {
  // Obtener los datos del cuerpo de la petición
  $input = file_get_contents('php://input');
  $data = json_decode($input, true);

  // Verificar que se haya enviado el mensaje
  if (!isset($data['msg']) || empty(trim($data['msg']))) {
    echo json_encode(['success' => false, 'response' => 'Mensaje vacío']);
    exit();
  }

  // URL de tu API
  $apiUrl = 'http://localhost:3000/send';

  // Preparar los datos para enviar a la API
  $apiData = ['msg' => trim($data['msg'])];

  // Configurar la petición
  $options = [
    'http' => [
      'header'  => "Content-Type: application/json\r\n",
      'method'  => 'POST',
      'content' => json_encode($apiData),
      'timeout' => 30, // timeout de 30 segundos
      'ignore_errors' => true
    ]
  ];

  $context = stream_context_create($options);
  $result = file_get_contents($apiUrl, false, $context);

  // Verificar si hubo error en la conexión
  if ($result === FALSE) {
    echo json_encode([
      'success' => false,
      'response' => 'Error al conectar con la API'
    ]);
    exit();
  }

  // Obtener información sobre la respuesta HTTP
  $httpCode = 200;
  if (isset($http_response_header)) {
    foreach ($http_response_header as $header) {
      if (preg_match('/^HTTP\/\d\.\d\s+(\d+)/', $header, $matches)) {
        $httpCode = intval($matches[1]);
        break;
      }
    }
  }

  // Decodificar la respuesta de la API
  $apiResponse = json_decode($result, true);

  // Verificar si la respuesta es válida JSON
  if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
      'success' => false,
      'response' => 'Respuesta inválida de la API'
    ]);
    exit();
  }

  // Verificar el código HTTP
  if ($httpCode >= 400) {
    echo json_encode([
      'success' => false,
      'response' => $apiResponse['response'] ?? 'Error en la API (código: ' . $httpCode . ')'
    ]);
    exit();
  }

  // Retornar la respuesta de la API
  echo json_encode($apiResponse);
} catch (Exception $e) {
  // Manejar errores inesperados
  echo json_encode([
    'success' => false,
    'response' => 'Error interno del servidor: ' . $e->getMessage()
  ]);
}
