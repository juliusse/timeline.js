echo "creating timeline.js..."

mkdir bin
mkdir bin\js

rm js\timeline_big.js
rm js\timeline_compiled.js
rm bin\js\timeline.js

cd js
touch timeline_big.js
for /r %%i in (*) do type %%i >> timeline_big.js
echo. >> timeline_big.js

java -jar ..\compiler.jar --js timeline_big.js --js_output_file timeline_compiled.js

echo /* author: Julius Seltenheim (mail@julius-seltenheim.com) */ > ..\bin\js\timeline.js
type timeline_compiled.js >> ..\bin\js\timeline.js

cd ..
echo "creation successful"