echo "creating timeline.js..."

cd js
rm timeline_big.js
rm timeline_compiled.js
rm timeline.js

touch timeline_big.js
for /r %%i in (*) do type %%i >> timeline_big.js
echo. >> timeline_big.js

java -jar ../compiler.jar --js timeline_big.js --js_output_file timeline_compiled.js

echo /* author: Julius Seltenheim (mail@julius-seltenheim.com) */ > timeline.js
type timeline_compiled.js >> timeline.js

cd ..
echo "creation successful"