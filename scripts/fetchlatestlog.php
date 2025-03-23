<?php

$mysqliobj = require __DIR__ . "/dbconnection.php";

$getlatestlog = "SELECT file_name FROM uploads_log WHERE 
upload_id=(SELECT max(upload_id) FROM uploads_log)";

$latestlog = $mysqliobj->query($getlatestlog);

$response =$latestlog->fetch_array()[0];

echo $response;

exit;