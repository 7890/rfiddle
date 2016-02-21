#!/bin/bash

#========================================================================
checkAvail()
{
	which "$1" >/dev/null 2>&1
	ret=$?
	if [ $ret -ne 0 ]
	then
		echo "tool \"$1\" not found. please install"
		exit 1
	fi
}

echo "building fiddle env"

for tool in java javac jar ant tar unzip; \
	do checkAvail "$tool"; done


cur=`pwd`

mkdir -p build
rm -rf build/*
cp archive/* build

cd build
tar xf 1.2.35.tar.gz 
rm -f 1.2.35.tar.gz*
cd env-js-1.2.35/
ant
cd ..
#in build
mkdir -p lib/envjs
cp -r env-js-1.2.35/dist/* lib/envjs/

unzip prettyprint.js-master.zip
rm -f prettyprint.js-master.zip*
cat prettyprint.js-master/prettyprint.js | grep -v "linearGrad.addColorStop" > lib/prettyprint.js

tar xf OpenLayers-2.13.1.tar.gz
rm OpenLayers-2.13.1.tar.gz*
cp OpenLayers-2.13.1/OpenLayers.js lib/

cp OpenLayers-2.13.1/OpenLayers.js ../openlayers/
cp -r OpenLayers-2.13.1/img ../openlayers/
cp -r OpenLayers-2.13.1/theme/ ../openlayers/
cp tile.stamen.v1.3.0.js ../openlayers/

mv rhino-1.7.7.1.jar lib/
rm -f rhino-1.7.7.1.jar*

mkdir -p lib/cmd
tar xf Rhino1_7_7_1_RELEASE.tar.gz 
echo "package cmd;" > lib/cmd/File.java
cat rhino-Rhino1_7_7_1_RELEASE/examples/File.java >> lib/cmd/File.java
rm -f Rhino1_7_7_1_RELEASE.tar.gz*

cd lib/cmd
javac -cp .:../rhino-1.7.7.1.jar *.java
cd ..
#in lib

cat - > start.js << _EOF_
print('loading libs...');
load('envjs/env.rhino.js');
load('prettyprint.js');
load('OpenLayers.js');
print('done.');

print('testing File command:');
print('defineClass("cmd.File");');
print('file=new File("/tmp/out.txt");');
print('file.writeLine("hello line");');
print('file.close();');
print('var a=file.readLines();');
_EOF_

cd "$cur"
#in home

cat - > start.sh << _EOF_
#!/bin/sh
cd build/lib
echo "java -cp .:rhino-1.7.7.1.jar org.mozilla.javascript.tools.debugger.Main -opt -1"
java -cp .:rhino-1.7.7.1.jar org.mozilla.javascript.tools.debugger.Main -opt -1
_EOF_

chmod 755 start.sh
ls -l ./start.sh
