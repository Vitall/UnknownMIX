<?php

class testRouter{
    public static function getTest(){
        if(isset($_GET['test'])){
            return $_GET['test'];
        }
    }
    
    public static function renderTest(){
        $testName = self::getTest();
       ?>
    <script> 
        Mix.autoload('tests.<?php echo $testName; ?>');
        var tester = Mix.obj('tests.<?php echo $testName; ?>');
        tester.setConsole('console');
        tester.start();
    </script>
       <?php
    }
}

?>

<!DOCTYPE html>
<html>
<head>
    <title><?php echo testRouter::getTest();?>
    
    </title>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
</head>
<body>
    <div id="console"></div>
    <script src ="http://code.jquery.com/jquery.min.js"></script>
<script src="../../mix-debug.js"></script>

<?php 

testRouter::renderTest();
?>


</body>
</html>
