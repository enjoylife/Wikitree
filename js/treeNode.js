/////////////////////////////////////////////////////////////////////////////
/*                                                                         //
*      treeNode.js                                                         //
*                                                                          //
*      treeNode 'class'                                                    //
*                                                                          //
*      each treeNode contains:                                             //
*          -articleName (string)                                           //
*          -array of children (length 2)                                   //
*          -depth (integer)                                                //
*          -isLeft (boolean) true if node is left child                    //
*                                                                          //
*      Brian Bergeron - bergeron@cmu.edu - www.bergeron.im                 //
*////////////////////////////////////////////////////////////////////////////



//treeNode 'constructor' creates a treeNode
function treeNode(articleName, depth, left){


	//instantiate vars
	this.article = articleName.indexOf("(")!= -1 ? 
					articleName.substring(0,articleName.indexOf("(")) : articleName; 
	this.children = [];
	this.depth = depth;
	this.isLeft = left;


	//set left child
	treeNode.prototype.setlChild = function(otherTreeNode){

		if(this.children == undefined)
			return;

		this.children[0] = otherTreeNode;
	}

	//set right child
	treeNode.prototype.setrChild = function(otherTreeNode){

		if(this.children == undefined)
			return;

		this.children[1] = otherTreeNode;
	}

}
