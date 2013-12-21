/*
 *   wikitree server
 */

/* Needed Node variables */
 var express = require('express');
 var http = require('http');
 var path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 1338);

////////

app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.compress());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, ''))); 


// development only

  app.use(express.errorHandler());

app.get('/wikitree', function(req,res){
  res.sendfile('index.html');
});

app.get('/wikitree/js/treeNode.js', function(req,res){
  res.set('Content-Type', 'text/javascript');
  res.sendfile('js/treeNode.js');
});

app.get('/wikitree/js/parse.js', function(req,res){
  res.set('Content-Type', 'text/javascript');
  res.sendfile('js/parse.js');
});

app.get('/wikitree/js/graph.js', function(req,res){
  res.set('Content-Type', 'text/javascript');
  res.sendfile('js/graph.js');
});

app.get('/wikitree/js/d3.v3.min.js', function(req,res){
  res.set('Content-Type', 'text/javascript');
  res.sendfile('js/d3.v3.min.js');
});

app.get('/wikitree/style.css', function(req,res){
  res.sendfile('style.css');
});


app.post('/sendUrl',  serveLink);


http.createServer(app).listen(app.get('port'), 
    function(){
      console.log('Express server listening on port ' + 
          app.get('port'));
  });


var redirectInfo ="";
function serveLink(req,resp){

  var artName = req.body.articleName.split(" ").join("%20");
  var urlToQuery = "/w/api.php?"
      +"format=json&action=query&titles="
      +artName +"&prop=revisions&rvprop=content";

      /* Setting up the API call parameters */
    var options = {
       host: 'en.wikipedia.org',
       path: urlToQuery

   };

   var jsonResp = '';

   try{
     //request Alchemy API
     var wikiReq = http.get(options, function(wikiResp) {

          //CALLBACK alchemy request
         wikiResp.on('end',function(){
             
             var checkRedo = parse(JSON.stringify(jsonResp),resp);

             if(!checkRedo)
             {
                resp.send("UNDEF");
             }

            else if(checkRedo[0]=="REDO"){

              redirectInfo+=("<b><font color=\"green\">Redirected </font></b><u>"+req.body.articleName.split("%20").join(" ")+ "</u> to <u>"+
                    checkRedo[1].body.articleName.split("%20").join(" "))+"</u><p>";

              serveLink(checkRedo[1],resp);

            }
            else if(checkRedo[0]=="DISAM"){

              redirectInfo+=("<b><font color=\"purple\">Disambiguated </font></b><u>"+req.body.articleName.split("%20").join(" ")+ "</u> to <u>"+
                    checkRedo[1].body.articleName.split("%20").join(" "))+"</u><p>";
  
              serveLink(checkRedo[1],resp);
            }

            //Lookup succeeded, send the data
            else{

              if(redirectInfo != "")
                checkRedo[2] = redirectInfo;
              resp.send(checkRedo);
              redirectInfo = "";
            }
         });



         wikiResp.setEncoding('utf8');

         //data comes in chunks, so concatenate them
         wikiResp.on('data', function (chunk) {
             jsonResp += chunk;
         });

         wikiResp.on('error', function (err) {
             resp.send("UNDEF");
         });
     });
  }

  catch(err){
    console.log(err);
    resp.send("UNDEF");
  }
    
}





function parse(rawHTML,respIfRedo){


//check if wiki gives disambiguation page
  if(rawHTML.indexOf("{{disambiguation}}") != -1){


    var newArt = handleDisambig(rawHTML);

    if(!newArt)
      return;

    return ["DISAM",{"body":{"articleName": newArt}}];
    
  }
  

//case: wikipedia redirectss
  var redirectCheck = handleRedirects(rawHTML);

  if(redirectCheck[0]){

    var redirArticle = redirectCheck[1];

    var redoReq = {"body":{"articleName": redirArticle}};

    return ["REDO",redoReq];

  }


  var nextLink;


//look for main word:
  var threeTickIndex = rawHTML.indexOf("'''");

  if(threeTickIndex == -1){
    console.log("DEBUG: couldnt find main word definition");
    return;
  }

  rawHTML = rawHTML.substring(threeTickIndex);


//chop until "is"
  var isIndex = rawHTML.indexOf(" is ");
  
  if(isIndex == -1)
    console.log("DEBUG: no \"is\"");
  else
    rawHTML = rawHTML.substring(isIndex);


  var firstLink = getFirstLink(rawHTML);

  var secondWordRIndex = rawHTML.indexOf("]]")+2;

  rawHTML = rawHTML.substring(secondWordRIndex);


  //its cool
  var secondLink = getFirstLink(rawHTML);

  return [firstLink,secondLink];


  return [firstLink,secondLink];


//TODO:dont parse in-page links
/*
  while(nextLink.indexOf("#") != -1){
    //alert("in page");
    rawHTML = rawHTML.substring(rawHTML.indexOf("]]")+2);
    nextLink = getFirstLink(rawHTML);
  }
*/


}




function getFirstLink(rawHTML){

  var lIndex = rawHTML.indexOf("[[");
  var rIndex = rawHTML.indexOf("]]");

  if(lIndex == -1 || rIndex == -1){
      console.log("DEBUG: no links could be found in article");
      return;
  }

  var nextLink = rawHTML.substring(lIndex+2,rIndex);

//if piped, extract link
  var pipeIndex = nextLink.indexOf("|");

  if(pipeIndex != -1)
    nextLink = nextLink.substring(0,pipeIndex);

  return nextLink;
}

function handleRedirects(rawHTML){

  if(rawHTML.toUpperCase().indexOf("#REDIRECT") != -1){
  
    rawHTML = rawHTML.substring(rawHTML.toUpperCase().indexOf("#REDIRECT"));
    rawHTML = rawHTML.substring(rawHTML.indexOf("[[")+2);
    rawHTML = rawHTML.substring(0,rawHTML.indexOf("]]"));


  //redirect is internal page, just get main page
    var internalRedirect = rawHTML.indexOf("#");

    if(internalRedirect != -1)
      rawHTML = rawHTML.substring(0,internalRedirect);

    return [true,rawHTML];
  }

  return [false];

}

function handleDisambig(rawHTML){



  var threeTickIndex = rawHTML.indexOf("'''");

  if(threeTickIndex == -1){
    console.log("Couldnt find main word definition for disambiguation");
    return;
  }

  rawHTML = rawHTML.substring(threeTickIndex);

  return getFirstLink(rawHTML);


}