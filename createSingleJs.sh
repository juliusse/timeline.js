echo "creating timeline.js..."

cd js
rm timeline.js

cat "classes/timeline.js" > timeline.js
cat "classes/timelineEntry.js" >> timeline.js
cat "classes/tooltip.js" >> timeline.js

cd ..
echo "creation successful"