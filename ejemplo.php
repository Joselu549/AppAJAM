<?php
  $host_name = 'db5016862719.hosting-data.io';
  $database = 'dbs13612531';
  $user_name = 'dbu571535';
  $password = 'AJAMbanda-2025';

  $link = new mysqli($host_name, $user_name, $password, $database);

  if ($link->connect_error) {
    die('<p>Error al conectar con servidor MySQL: '. $link->connect_error .'</p>');
  } else {
    echo '<p>Se ha establecido la conexión al servidor MySQL con éxito.</p>';
  }
?>