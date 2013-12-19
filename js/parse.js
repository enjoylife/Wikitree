
function HTTPREQ(node){

	
	var article = node.article.split(" ").join("%20");
	


	    $.ajax({
	    async:false,
        url: "/wikitree/sendUrl",
        type: "post",
        datatype:"json",
        data: {'articleName': article},
        success: function(response){


        	if(response == "UNDEF" || response == undefined ){
        		alert("undef");
        		return;
        	}

        	//alert(response);

        	node.setlChild(new treeNode(response[0],node.depth+1));

   			node.setrChild(new treeNode(response[1],node.depth+1));

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


	
	var head = new treeNode(article);
    
    document.getElementById("d3graph").innerHTML ="";

	graph(head);

	//dont do this for first elem
	//createChildren(head);

}


