#!/bin/bash

declare -a dirs=(
   codemorphs
   commonlib-node
   commonlib-shared
   root
   server
   watr-front
)

for i in "${dirs[@]}"
do
   cd "packages/$i" || exit
   ncu -ui
   cd ../..
done
