#!/bin/bash
./commencer.sh

nohup python srfe.py 2>&1 | tee -a srfe.log
PID=$!
echo $PID > srfe.pid

exit 0
