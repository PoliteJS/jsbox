JSBox
=====

this jQuery plugin allow to create a Javascript exercise box within an HTML web page.

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
