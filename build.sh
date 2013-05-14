#!/bin/sh
#
# This script expects to find the following in the current directory:
#   parser.js.pre  - the preamble of the resulting javascript file
#   parser.js.post - the postamble of the resulting javascript file
#
# It will output a file called jargone.js
# It can be run from this directory as ./build.sh

cat parser.js.pre > parser.js
car parser.core.js >> parser.js
cat parser.js.post >> parser.js
