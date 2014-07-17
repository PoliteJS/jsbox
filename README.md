JSBox
=====

**JSBox** is an easy to use jQuery plugin you can use **to embed a Javascript sandbox in any web page**.

[http://PoliteJS.com/jsbox](http://politejs.com/jsbox)  
[http://github.com/PoliteJS/jsbox](http://github.com/politejs/jsbox)

## Build JSBox <small>from the source</small>


In order to make a developement release you need:

- [NodeJS](http://nodejs.org)
- [GruntJS](http://gruntjs.com)

then you can run the following command:

    npm install && grunt
    

## How To Use

> For a complete documentation and usage examples visit [PoliteJS/jsbox](http://politejs.com/jsbox).
    
    <!-- HTML -->
    <div data-jsbox>
        
        <!-- [optional] code you want to show in the box -->
        <code>a = 'foo';</code>
        
        <!-- [optional] a list of tests you want to run -->
        <ul>
            <li>a === 'foo';</li>
        </ul>
    </div>
    
    <!-- JS (put it at the bottom of your page) -->
    <script src="//code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="jquery.jsbox-x.x.x.js"></script>
    
**NOTE:** whatever _DOM Element_ with an `data-jsbox` attribute will be activated as a _JSBox_ as soon as the page loads!

## Tested On
    
- Mac
  - Canary
  - Chrome
  - Safari
  - Firefox
  - Opera
- iOS
  - Mobile Safari
  - Mobile Chrome
