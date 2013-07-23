echo "creating timeline.js..."

cd js
rm timeline.js

echo  /**/ > timeline.js
for /r %%i in (*) do type %%i >> timeline.js


cd ..
echo "creation successful"