#!/bin/bash
set -e
unzip waypoint-v0.4-vercel.zip -d app
cd app
npm install
npm run build
mkdir -p ../public
cp -r dist/* ../public/
