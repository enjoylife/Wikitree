Wikitree
========

[bergeron.im/wikitree](http://bergeron.im/wikitree)
---------------------------------------------------

Wikitree graphs connections between Wikipedia articles using the [MediaWiki API](http://www.mediawiki.org/wiki/API:Main_page).  It extracts the first two links in each Wikipedia article and graphs the resulting tree of information using the [D3 library](http://d3js.org/).  

Features
--------

Wikitree handles internal redirects, disambiguation pages, in-page links, and dead ends.  Each time a page is requested, the status of the request is displayed in a sidebar.  Clicking a node either explores that article (if leaf node) or collapses the subtree.