//treenode
function treeNode(articleName, depth, left){


	this.article = articleName.indexOf("(")!= -1 ? 
					articleName.substring(0,articleName.indexOf("(")) : articleName; 
	this.children = [];
	this.depth = depth;
	this.isLeft = left;


	treeNode.prototype.setlChild = function(otherTreeNode){

		if(this.children == undefined)
			alert("undef "+this.article+"other "+otherTreeNode.article);

		this.children[0] = otherTreeNode;
	}

	treeNode.prototype.setrChild = function(otherTreeNode){

		this.children[1] = otherTreeNode;
	}


}
