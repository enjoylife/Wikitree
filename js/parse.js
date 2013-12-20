
function HTTPREQ(node){

	
	var article = node.article.split(" ").join("%20");
	


	    $.ajax({
	    async:false,
        url: "/wikitree/sendUrl",
        type: "post",
        datatype:"json",
        data: {'articleName': article},
        success: function(response){


        	if(response == "UNDEF" || !response ){

        		document.getElementById("info").innerHTML
        			+= "<font color=\"red\">Dead end</font> at <u>"+node.article+"</u><br><br>";
        		return;
        	}

        	else if (response[2]){
        			document.getElementById("info").innerHTML
        			+= response[2];
        	}

        	//alert(response);

        	node.setlChild(new treeNode(response[0],node.depth+1, true));

   			node.setrChild(new treeNode(response[1],node.depth+1,false));

        	//
        	
        	//TODO. parse it about to do a bunch of work.  move this work serverside
        	//parse(node,response.rawHTML);
	
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


	//info sidebar gets reset
	document.getElementById("info").innerHTML = "";
	var head = new treeNode(article);
    
    document.getElementById("d3graph").innerHTML ="";

	graph(head);

	//dont do this for first elem
	//createChildren(head);

}


