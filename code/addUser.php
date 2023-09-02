<?php
$servername = "localhost";
$username = "root";
$password = "felios123";
$dbname = "web";
$host="p:localhost";
$port=3306;


$con = new mysqli($host, $user, $password, $dbname, $port, $socket)
	or die ('Could not connect to the database server' . mysqli_connect_error());

//$con->close();


// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

// Get data from POST request
$postData = json_decode(file_get_contents('php://input'), true);
$userName = $postData['username'];
$email = $postData['email'];
$userPassword = $postData['password'];

// Insert data into database
$stmt = $conn->prepare("INSERT INTO user (username, email, password) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $userName, $email, $userPassword);

if ($stmt->execute()) {
    echo "User added successfully";
} else {
    echo "Error: " . $stmt->error;
}

$stmt->close();
$conn->close();
?>


