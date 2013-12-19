//treenode
function treeNode(articleName, depth){

	this.article = articleName;
	this.children = [];
	this.depth = depth;


	treeNode.prototype.setlChild = function(otherTreeNode){

		if(this.children == undefined)
			alert("undef "+this.article+"other "+otherTreeNode.article);

		this.children[0] = otherTreeNode;
	}

	treeNode.prototype.setrChild = function(otherTreeNode){

		this.children[1] = otherTreeNode;
	}


}
