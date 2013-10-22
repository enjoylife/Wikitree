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


function parse(node, rawHTML){

	

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

		node.article = handleDisambig(rawHTML);
		createChildren(node);
		return;
	}
	

//case: wikipedia redirectss
	var redirectCheck = handleRedirects(rawHTML);

	if(redirectCheck[0]){

		node.article = getHTML(redirectCheck[1]);
		createChildren(node);
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

	var NONE1 = new treeNode("NONE");
	var NONE2 = new treeNode("NONE");
	var NONE3 = new treeNode("NONE");
	var NONE4 = new treeNode("NONE");

	// var eh1 = new treeNode("A");
	// var eh2 = new treeNode("B");

	var firstChild = new treeNode(firstLink);
//	firstChild.setlChild(NONE1); 
	//firstChild.setrChild(NONE3); 

	 var secondChild = new treeNode(secondLink);
	// secondChild.setlChild(NONE2);
	// secondChild.setrChild(NONE4);
	
	 node.setlChild(firstChild);

	 node.setrChild(secondChild);

	//alert(head.children[0].children[0].article);
	//document.getElementById("d3graph").innerHTML ="ass";
	//graph(head);

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

var graph = true;
function HTTPREQ(node){

	
	var article = node.article.split(" ").join("%20");
	
	var ret;

	var URL = "http://en.wikipedia.org/w/api.php?"
			+"format=json&action=query&titles="
			+article+"&prop=revisions&rvprop=content";


	    $.ajax({
	    async:false,
        url: "/cgi-bin/scrape.py",
        type: "post",
        datatype:"json",
        data: {'URL': URL},
        success: function(response){
        	
        	parse(node,response.rawHTML);
	
        	
        }
    });

	
}


function createChildren(node){

	if(node.article == undefined)
		return;

	HTTPREQ(node);
	//alert("HERE "+temp[0].article)


}



function initArticle(article){


	
	var head = new treeNode(article);
	graph(head);

	//createChildren(head);

}


$(window).load(function(){ initArticle("algebra")});