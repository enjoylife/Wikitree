/////////////////////////////////////////////////////////////////////////////
/*                                                                         //
*      req.js                                                              //
*                                                                          //
*      When node is clicked, POSTs server with article name.               //
*      Also updates sidebar with redirect/disambiguation/dead end info     //
*                                                                          //
*      Brian Bergeron - bergeron@cmu.edu - www.bergeron.im                 //
*////////////////////////////////////////////////////////////////////////////


//does AJAX POST request, creates new nodes in graph, updates sidebar
function HTTPREQ(node){

	
    //escape spaces
	var article = node.article.split(" ").join("%20");
	

        //AJAX POST
	    $.ajax({
	    async:false,
        url: "/wikitree/sendUrl",
        type: "post",
        datatype:"json",
        data: {'articleName': article},
        success: function(response){

            //dead end case
        	if(response == "UNDEF" || !response ){

        		document.getElementById("info").innerHTML
        			+= "<font color=\"red\">Dead end</font> at <u>"+node.article+"</u><p>";
        		return;
        	}

            //update sidebar with redirect info
        	else if (response[2]){
        			document.getElementById("info").innerHTML
        			+= response[2];
        	}

            //give node children with article names
        	node.setlChild(new treeNode(response[0],node.depth+1, true));
   			node.setrChild(new treeNode(response[1],node.depth+1,false));

	
        }
    });

	
}

//updates sidebar with "Exploring ...." and calls HTTPREQ
function createChildren(node){

	if(node.article == undefined)
		return;

    document.getElementById("info").innerHTML+="<b><font color=\"blue\">Exploring</b></font> "+node.article+"<p>";

	HTTPREQ(node);

}


//creates root note. Resets sidebar and graph
function initArticle(article){


	//sidebar resets
	document.getElementById("info").innerHTML = "";

	var head = new treeNode(article);
    head.isLeft = true;
    
    //graph resets
    document.getElementById("d3graph").innerHTML ="";

    //graphs root node
	graph(head);

}


