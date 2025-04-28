<?php 
require_once 'vendor/autoload.php';

$game_array = [
    "0" => "symb0",
    "1" => "symb1",
    "2" => "symb2",
    "3_1" => "symb3",
    "3_2" => "symb4",
    "3_3" => "symb5"
];


$loader = new \Twig\Loader\FilesystemLoader(__DIR__.'\templates');
$twig = new \Twig\Environment($loader);


$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $uri);

// Маршрутизация
switch ($segments[0]) {
    case '': 
        echo $twig->render('main_menu.twig');
        break;
    case 'game':
        if (isset($segments[1])) {
            echo $segments[1];
            break;

        }
        else {
            http_response_code(404);
            echo $twig->render('404.twig');
        }
        break;
    case 'settings':
        echo $twig->render('global_settings.twig');
    default:
        // Устанавливаем HTTP статус 404
        http_response_code(404);
        echo $twig->render('404.twig');
        break;
}

