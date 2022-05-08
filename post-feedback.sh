#! /bin/bash

if [ $# -lt 3 ]; then
  echo "Usage: post-feedback.sh <site> <name> <folder with student folders>"
  exit 1
fi

for i in $3/*; do
    user=$(cat $i/EMAIL)
    ./admin feedback $1 $user $2 $i/report.txt
done
