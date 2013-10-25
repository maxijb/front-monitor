#!/bin/bash -x

cd /var/log/despegar/forever
DATE_SERVER=$(date +"%d-%m-%Y")
COUNT_FILES=$(ls | grep -c .)
cp front-monitor.log front-monitor.log.$DATE_SERVER.$COUNT_FILES
cat /dev/null > front-monitor.log
gzip -f front-monitor.log.$DATE_SERVER.$COUNT_FILES