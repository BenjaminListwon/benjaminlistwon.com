#!/bin/sh
USER=blistwon
HOST=w2-bl
DIR=/home/blistwon/benjaminlistwon.com/   # might sometimes be empty!

rsync -avz --delete public ${USER}@${HOST}:${DIR}

exit 0