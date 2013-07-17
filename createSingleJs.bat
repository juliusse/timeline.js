echo "creating timeline.js..."

cd js
rm timeline.js

type "classes\timeline.js" > timeline.js
type "classes\timelineEntry.js" >> timeline.js
type "classes\tooltip.js" >> timeline.js

cd ..
echo "creation successful"