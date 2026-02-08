#!/bin/bash

if [ -z "$1" ]; then
    echo "Error: No title provided."
    echo "Usage: ./title_generator.sh 'Your Title Here' 'TitleType_is_your_DirectoryName'"
    exit 1
fi
if [ -z "$2" ]; then
    echo "Error: No title type provided."
    echo "Usage: ./title_generator.sh 'Your Title Here' 'TitleType_is_your_DirectoryName'"
    exit 1
fi

font="smslant"
titletype=$2
title=$1
titlelen=${#title}

mkdir -p $titletype

for (( i=1; i<=$titlelen; i++ )); do
    echo $title | fold -w $i | figlet -k -w 500 -f $font > "$titletype/$i.txt"
done
