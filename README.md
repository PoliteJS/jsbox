JSBox
=====

this jQuery plugin allow to create a Javascript exercise box within an HTML web page.

## How to Build

In order to build the jQuery plugin you need _NodeJS_ installed on your machine and
the task runner _GruntJS_.

Then you can run:

    npm install && grunt

## How To Use
    
    <!-- put this into the page BODY -->
    <div id="jsbox">
        <code>a = ;</code>
        <ul>
            <li>a === 'foo';
        </ul>
    </div>
    
    <!-- libraries -->
    <script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="jquery.jsbox.js"></script>
    
    <!-- runner -->
    <script>
    $('#jsbox').jsbox();
    </script>

## Tested On
    
- Mac
  - Canary
  - Chrome
  - Safari
  - Firefox
  - Opera
