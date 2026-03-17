<?php 
require_once '../vendor/autoload.php';

$game_array = [
    "0" => ["folder" => "S0", "startChapter" => 1, "gamename" => "Симбионт 0"],
    "1" => ["folder" => "S1", "startChapter" => 1, "gamename" => "Симбионт 1"],
    "2" => ["folder" => "S2", "startChapter" => 1, "gamename" => "Симбионт 2"],
    "3_1" => ["folder" => "S3", "startChapter" => 1, "gamename" => "Симбионт 3"],
    "3_2" => ["folder" => "S3", "startChapter" => 2263, "gamename" => "Симбионт 3"],
    "3_3" => ["folder" => "S3", "startChapter" => 1, "gamename" => "Симбионт 3"]
];


$loader = new \Twig\Loader\FilesystemLoader(__DIR__ . '/../templates');
$twig = new \Twig\Environment($loader);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);



if (str_starts_with($uri, '/api/')) {
    header('Content-Type: application/json; charset=utf-8');
    require __DIR__ . '/api.php';
    exit;
}

$uri = trim(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), '/');
$segments = explode('/', $uri);

// Маршрутизация
switch ($segments[0]) {
    case '': 
        echo $twig->render('main_menu.twig');
        break;
    case 'game':
        if (isset($segments[1]) and array_key_exists($segments[1],$game_array)) {
            // echo $game_array[$segments[1]];
            echo $twig->render('game.twig',[
                'maintext'=>'/assets/game_assets/'. $game_array[$segments[1]]['folder'] . '/localizations/text.xml',
                'gamename' => $game_array[$segments[1]]['gamename'],
                'gamefolder' => $game_array[$segments[1]]['folder'],
                'gamedata' => $segments[1]
            ]);
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
        http_response_code(404);
        echo $twig->render('404.twig');
        break;
}

