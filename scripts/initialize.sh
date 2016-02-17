#!/bin/bash

export jobserver=ly-1-02

curl -X DELETE $jobserver':8090/contexts/compass'

curl --data-binary @target/scala-2.10/interface_2.10-0.1-SNAPSHOT.jar $jobserver:8090/jars/interface

curl -d '' $jobserver':8090/contexts/compass?num-cpu-cores=4&memory-per-node=8g'

curl -d '' $jobserver':8090/jobs?context=compass&appName=interface&classPath=l1000.initialize'


