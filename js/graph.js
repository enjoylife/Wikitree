/////////////////////////////////////////////////////////////////////////////
/*                                                                         //
*      graph.js                                                            //
*                                                                          //
*      Graphs tree of articles using D3.  Updates each time node clicked   //
*                                                                          //
*      Brian Bergeron - bergeron@cmu.edu - www.bergeron.im                 //
*////////////////////////////////////////////////////////////////////////////


var tree,root,svg,i,diagonal;


//called to initialize graph (to graph root node)
function graph(jsonTree){

    //set width/height of graph
    var margin = {top: 60, right: 0, bottom: 0, left: 0},
    width =  1024 - margin.right - margin.left,
    height = 1024 - margin.top - margin.bottom;
    
    i = 0,
    duration = 500;

   //create tree
   tree = d3.layout.tree()
   .size([width, height]);

   diagonal = d3.svg.diagonal()
   .projection(function(d) { return [d.x, d.y]; });

    //append svg elem to document
    svg = d3.select("#d3graph").append("svg")
    .attr("width", width + margin.right + margin.left)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "svg")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //set root node pos
    root = jsonTree;
    root.x0 = height / 2;
    root.y0 = 0;

    //graph contents have changed, must update
    update(root);


  }


//updates/redraws graph.  Called any time its contents change
function update(source) {


  // Compute the new tree layout.
  var nodes = tree.nodes(root).reverse(),
      links = tree.links(nodes);

  // Normalize for fixed-depth.
  nodes.forEach(function(d) { d.y = d.depth * 150; });

  // Update the nodes…
  var node = svg.selectAll("g.node")
      .data(nodes, function(d) { return d.id || (d.id = ++i); });

  // Enter any new nodes at the parent's previous position.
  var nodeEnter = node.enter().append("g")
      .attr("class", "node")
      .attr("transform", function(d) { return "translate(" + source.x0 + "," + source.y0 + ")"; })
      .on("click", click);


  nodeEnter.append("circle")
      .attr("r", 1e-6)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  //append article text (20px if short title, 15px otherwise)
  nodeEnter.append("text")
      .attr("x", function(d) { return d.children || d._children ? 0 : 0; })
      .attr("dy", function(d){return d.isLeft ? "-.4em" : "1em"})
      .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
      .text(function(d) { return d.article})
      .style("fill-opacity", 1e-6)
      .style("z-index", 6)
      .style("font-size", function(d){
              return d.article.length < 10 ? "20px": "15px";
            });

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

  nodeUpdate.select("circle")
      .attr("r", 25)
      .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });

  nodeUpdate.select("text")
      .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit().transition()
      .duration(duration)
      .attr("transform", function(d) { return "translate(" + source.x + "," + source.y+ ")"; })
      .remove();

  nodeExit.select("circle")
      .attr("r", 1e-6);

  nodeExit.select("text")
      .style("fill-opacity", 1e-6);

  // Update the links…
  var link = svg.selectAll("path.link")
      .data(links, function(d) { return d.target.id; });

  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
      .attr("class", "link")
      .attr("d", function(d) {
        var o = {x: source.x0, y: source.y0};
        return diagonal({source: o, target: o});
      });

  // Transition links to their new position.
  link.transition()
      .duration(duration)
      .attr("d", diagonal);

  // Transition exiting nodes to the parent's new position.
  link.exit().transition()
      .duration(duration)
      .attr("d", function(d) {
        var o = {x: source.x, y: source.y};
        return diagonal({source: o, target: o});
      })
      .remove();

  // Stash the old positions for transition.
  nodes.forEach(function(d) {
    d.x0 = d.x;
    d.y0 = d.y;
  });
}



//Toggle children on click.  Collapse if interior node, explore if leaf node
//d._children represents collapsed children, 
//d.children represents visible children
function click(d) {

  //if has children, set them to null (collapses)
  if (d.children) {

    d._children = d.children;
    d.children = null;
  } 

  //if has collapsed children, set them freeeeeeeeeeeeee
  else if(d._children){

    d.children = d._children;

    if(!d.children[0] && !d.children[1])
      createChildren(d);

    d._children = null;
  }

  else{

    //Node is unexplored. Lets explore it.
    //(unless weve reached max depth)
    d.children=[];

    if(d.depth<6)
      createChildren(d);
  }

  //graph changed, must update
  update(d);


}
