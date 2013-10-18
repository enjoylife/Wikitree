function getFirstLink(rawHTML){

	var lIndex = rawHTML.indexOf("[[");
	var rIndex = rawHTML.indexOf("]]");

	if(lIndex == -1 || rIndex == -1){
			alert("no links could be found in article");
			return;
	}

	return rawHTML.substring(lIndex+2,rIndex);
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

function parse(rawHTML){

	

	if(rawHTML == "URLERR"){	
		alert("Could not find article");
		return;
	}
	else if(rawHTML == "DISAMBIG"){
		alert("disambiguation: ");
		return;
	}
	else if(rawHTML == "MISSINGPAGE"){
		alert("missing page");
		return;
	}


//now we know we have a json of a looked up article:
	

//case: wikipedia redirectss
	var redirectCheck = handleRedirects(rawHTML);

	if(redirectCheck[0]){

		getHTML(redirectCheck[1]);
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

	nextLink = getFirstLink(rawHTML);

//dont parse in-page links
	while(nextLink.indexOf("#") != -1){
		//alert("in page");
		rawHTML = rawHTML.substring(rawHTML.indexOf("]]")+2);
		nextLink = getFirstLink(rawHTML);
	}


//if piped, extract link
	var pipeIndex = nextLink.indexOf("|");

	if(pipeIndex != -1)
		nextLink = nextLink.substring(0,pipeIndex);



	getHTML(nextLink);


}




function getHTML(article){

	article = article.split(" ").join("%20");

	
	
	document.getElementById("results").innerHTML +=
	 article.split("%20").join(" ")+"<br>";

	if(article.toLowerCase() == "philosophy"){

		alert("done");
		return;

	}

	var URL = "http://en.wikipedia.org/w/api.php?format=json&action=query&titles="
	+article+"&prop=revisions&rvprop=content";

    $.ajax({
        url: "/cgi-bin/scrape.py",
        type: "post",
        datatype:"json",
        data: {'URL': URL},
        success: function(response){
            parse(response.rawHTML);
        }
    });

          



}