<?php

$host = "localhost";
$dbname = "portfolio_db";
$username = "root";
$password = "";

$mysqliobj = new mysqli($host,$username,$password,$dbname);

if($mysqliobj->connect_errno)
{
 die("Connection error: " . $mysqliobj->connect_error);
}

return $mysqliobj;