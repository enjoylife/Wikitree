/////////////////////////////////////////////////////////////////////////////
/*                                                                         //
*      Wikitree server - wikitreeServer.js                                 //
*                                                                          //
*      Serves static html/css/js files.  Replies to POST request           //
*      for article data.  Queries wikipedia API, extracts links,           //
*      handles redirects, and responds to client with article data.        //
*                                                                          //
*      Brian Bergeron - bergeron@cmu.edu - www.bergeron.im                 //
*////////////////////////////////////////////////////////////////////////////



/////////////////////////////////////////////////////////////////////////////
/*SETTING UP NODE/EXPRESS*/
/////////////////////////////////////////////////////////////////////////////

/* Needed Node variables */
var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

//Set port to 1338
app.set('port', process.env.PORT || 1338);

//set up express
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.compress());
app.use(express.methodOverride());
app.use(app.router);

//Serves static files
app.use(express.static(path.join(__dirname, ''))); 


//Called when article is requested
app.post('/sendUrl',  serveLink);

//Server listen to port 1338 (nginx redirects 80 to 1338)
http.createServer(app).listen(app.get('port'), 
    function(){
      console.log('Express server listening on port ' + 
          app.get('port'));
  });



/////////////////////////////////////////////////////////////////////////////
/*THE WORK BEGINS*/
/////////////////////////////////////////////////////////////////////////////


//if redirected or disambiguated, redirectInfo will tell us where we redirected
var redirectInfo ="";

//serveLink takes in requested article and responds to client with new links 
//(or "Dead end") and disambiguation/redirect information for updating sidebar
function serveLink(req,resp){

  //get article name from request
  var artName = req.body.articleName.split(" ").join("%20");
  var urlToQuery = "/w/api.php?"
      +"format=json&action=query&titles="
      +artName +"&prop=revisions&rvprop=content";

      /* Setting up the API call parameters */
    var options = {
       host: 'en.wikipedia.org',
       path: urlToQuery

   };

   //jsonResp will be returned to client
   var jsonResp = '';

   try{
     //request Alchemy API
     var wikiReq = http.get(options, function(wikiResp) {

          //CALLBACK alchemy request
         wikiResp.on('end',function(){
             
             //if we were redirected, checkRedo will tell us
             var checkRedo = parse(JSON.stringify(jsonResp),resp);

             //no article found "Dead end"
             if(!checkRedo)
             {
                resp.send("UNDEF");
             }

            //redirected
            else if(checkRedo[0]=="REDO"){

              redirectInfo+=("<b><font color=\"green\">Redirected </font></b><u>"+req.body.articleName.split("%20").join(" ")+ "</u> to <u>"+
                    checkRedo[1].body.articleName.split("%20").join(" "))+"</u><p>";

              serveLink(checkRedo[1],resp);

            }

            //landed on disambiguation page
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

  //catch err on querying wikipedia API.  Send user "Dead end"
  catch(err){
    console.log(err);
    resp.send("UNDEF");
  }
    
}



//parse extracts the first two links in the article (if they exist)
//handles redirects (in/out of page) and  disambiguation pages/dead ends
function parse(rawHTML,respIfRedo){


//check if wiki gives disambiguation page
  if(rawHTML.indexOf("{{disambiguation}}") != -1){

    //extract first article from disambiguation list
    var newArt = handleDisambig(rawHTML);

    if(!newArt)
      return;

    return ["DISAM",{"body":{"articleName": newArt}}];
    
  }
  

//check if wikipedia redirectss
  var redirectCheck = handleRedirects(rawHTML);

  if(redirectCheck[0]){

    return ["REDO",{"body":{"articleName": redirectCheck[1]}}];

  }

//////////////Now we will look for links//////////////////


//look for main word:
  var threeTickIndex = rawHTML.indexOf("'''");

  //dead end case.
  if(threeTickIndex == -1){
    console.log("DEBUG: couldnt find main word definition");
    return;
  }

  //chops rawHTML after main article word
  rawHTML = rawHTML.substring(threeTickIndex);


//chop until "is"
  var isIndex = rawHTML.indexOf(" is ");
  
  if(isIndex == -1)
    console.log("DEBUG: no \"is\"");
  else
    rawHTML = rawHTML.substring(isIndex);


  //extract first link
  var firstLink = getFirstLink(rawHTML);

  //chop second link
  var secondWordRIndex = rawHTML.indexOf("]]")+2;
  rawHTML = rawHTML.substring(secondWordRIndex);


  //extract second link (calling getFirstLink because we chopped rawHTML)
  var secondLink = getFirstLink(rawHTML);

  return [firstLink,secondLink];


}



//Gets first link in rawHTML by looking for matching square brackets
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


//checks if wikipedia redirects the article by looking for "#REDIRECT"
function handleRedirects(rawHTML){

  if(rawHTML.toUpperCase().indexOf("#REDIRECT") != -1){
  
    rawHTML = rawHTML.substring(rawHTML.toUpperCase().indexOf("#REDIRECT"));
    rawHTML = rawHTML.substring(rawHTML.indexOf("[[")+2);
    rawHTML = rawHTML.substring(0,rawHTML.indexOf("]]"));


  //redirect is internal page, just get main page
    var internalRedirect = rawHTML.indexOf("#");

    if(internalRedirect != -1)
      rawHTML = rawHTML.substring(0,internalRedirect);

    //return true and the new page to redirect to
    return [true,rawHTML];
  }

  //no redirect
  return [false];

}

//if we landed on disambiguation page, redirect to first article
function handleDisambig(rawHTML){

  var threeTickIndex = rawHTML.indexOf("'''");

  if(threeTickIndex == -1){
    console.log("Couldnt find main word definition for disambiguation");
    return;
  }

  rawHTML = rawHTML.substring(threeTickIndex);

  return getFirstLink(rawHTML);


}