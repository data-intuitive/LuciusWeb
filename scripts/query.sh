#!/bin/bash

export jobserver=ly-1-02

curl -d $'query= HSPA1A DNAJB1 BAG3 P4HA2 HSPA8 TMEM97 SPR DDIT4 HMOX1 -TSEN2 \n sorted=false' $jobserver':8090/jobs?context=compass&appName=interface&classPath=l1000.zhang&sync=true'



