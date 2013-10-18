#!/usr/bin/env python

import sys
import json
import cgi
import urllib2

fs = cgi.FieldStorage()

sys.stdout.write("Content-Type: application/json")

sys.stdout.write("\n")
sys.stdout.write("\n")

article = fs.getvalue("URL")
result = {}

try:
	req = urllib2.Request(article)
	response = urllib2.urlopen(req)
	result['rawHTML'] = the_page = response.read()
except:
	result['rawHTML'] = 'URLERR'


if result['rawHTML'] != 'URLERR':
	if the_page.find("{{disambiguation}}") != -1:
		result['rawHTML'] = "ITSADISAMBIG!" + the_page
	if the_page.find("\"missing\":\"\"") != -1:
		result['rawHTML'] = 'MISSINGPAGE'



sys.stdout.write(json.dumps(result,indent=1))
sys.stdout.write("\n")

sys.stdout.close()
