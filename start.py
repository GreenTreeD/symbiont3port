import subprocess
import os

# Путь к директории с index.php
project_dir = os.getcwd()

# Команда запуска встроенного сервера
command = ['php', '-S', 'localhost:8000', '-t', project_dir]

# Запуск
subprocess.run(command)