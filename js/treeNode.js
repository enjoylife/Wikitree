//treenode
function treeNode(articleName){

	this.article = articleName;
	this.lChild = null;
	this.rChild = null;
	this.rawHTML = null;

	treeNode.prototype.setlChild = function(otherTreeNode){

		this.lChild = otherTreeNode;
	}

	treeNode.prototype.setrChild = function(otherTreeNode){

		this.rChild = otherTreeNode;
	}

	treeNode.prototype.print = function(){

		//document.getElementById("results").innerHTML += this.article;
	}

}
