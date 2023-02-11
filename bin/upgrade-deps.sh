#!/bin/bash

declare -a dirs=(
   commonlib-node
   commonlib-shared
   server
   watr-front
)

for i in "${dirs[@]}"
do
   cd "packages/$i" || exit
   ncu -ui
   cd ../..
done
