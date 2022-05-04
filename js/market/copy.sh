npm run build
rm -rf ../../mopidy_market/static/static
mkdir ../../mopidy_market/static/static/
cp -R build/static/* ../../mopidy_market/static/static/
cp -R public/icons ../../mopidy_market/static/
cp build/index.html ../../mopidy_market/static/
