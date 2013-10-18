function getFirstLink(rawHTML){

	var lIndex = rawHTML.indexOf("[[");
	var rIndex = rawHTML.indexOf("]]");

	if(lIndex == -1 || rIndex == -1){
			alert("no links could be found in article");
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
		alert("couldnt find main word definition");
		return;
	}

	rawHTML = rawHTML.substring(threeTickIndex);

	return getFirstLink(rawHTML);

}


function parse(node, depth){

	var rawHTML = node.rawHTML;

	if(rawHTML == "URLERR"){	
		alert("Could not find article");
		return ["err","err"];
	}

	else if(rawHTML == "MISSINGPAGE"){
		alert("missing page");
		return ["err","err"];
	}


	
//now we know we have a json of a looked up article:

//check if wiki gives disambiguation page
	if(rawHTML.indexOf("ITSADISAMBIG!") == 0 ){
		getHTML(handleDisambig(rawHTML),depth);
		return;
	}
	

//case: wikipedia redirectss
	var redirectCheck = handleRedirects(rawHTML);

	if(redirectCheck[0]){

		getHTML(redirectCheck[1],depth);
		return;
	}


	var nextLink;

//look for main word:
	var threeTickIndex = rawHTML.indexOf("'''");

	if(threeTickIndex == -1){
		alert("couldnt find main word definition");
		return;
	}

	rawHTML = rawHTML.substring(threeTickIndex);


//chop until "is"
	var isIndex = rawHTML.indexOf(" is ");
	
	if(isIndex == -1)
		alert("no \"is\"");
	else
		rawHTML = rawHTML.substring(isIndex);


	var firstLink = getFirstLink(rawHTML);

	var secondWordRIndex = rawHTML.indexOf("]]")+2;

	rawHTML = rawHTML.substring(secondWordRIndex);


// its cool
	var secondLink = getFirstLink(rawHTML);

	var firstChild = new treeNode(firstLink);
	var secondChild = new treeNode(secondLink);

	node.setlChild(firstChild);

	node.setrChild(secondChild);

	return [firstChild,secondChild];

//TODO:dont parse in-page links
/*
	while(nextLink.indexOf("#") != -1){
		//alert("in page");
		rawHTML = rawHTML.substring(rawHTML.indexOf("]]")+2);
		nextLink = getFirstLink(rawHTML);
	}
*/




}

//printing vars
var lastDepth = false;
var order = "";

function getHTML(node, depth){


	order+=  "<br>"+node.article+ "<br>";
	//alert("Getting html: " + node.article);


	var article = node.article.split(" ").join("%20");


//printing
	if(depth!=lastDepth){
		document.getElementById("results").innerHTML += "<br><br>(Depth: "+depth+")";
		
	}

	for(var i = 0; i < depth;i ++){
		document.getElementById("results").innerHTML +=
		"&#160;&#160;&#160;&#160;&#160;&#160;";

	}

	document.getElementById("results").innerHTML += 
	 article.split("%20").join(" ");

	lastDepth = depth;	
//printing

	var URL = "http://en.wikipedia.org/w/api.php?format=json&action=query&titles="
	+article+"&prop=revisions&rvprop=content";

	var childLinks;

    $.ajax({
        url: "/cgi-bin/scrape.py",
        type: "post",
        datatype:"json",
        data: {'URL': URL},
        success: function(response){
        	node.rawHTML = response.rawHTML;
            var children = parse(node);

            if(depth == 1){
				//document.getElementById("results").innerHTML += order;
				return;
			}

            getHTML(children[0], depth -1);
            getHTML(children[1], depth -1);

           
        }
    });
 

}



function startGraphing(article,depth){


	lastDepth = depth+1;

	var head = new treeNode(article);
	getHTML(head,depth);



}