.PHONY: init
init: 
	npm install
	rm -rf package-lock.json

.PHONY: build
build:
	./node_modules/.bin/rollup -c rollup.config.js
	cp README.md dist/
	node ./scripts/publish.js

.PHONY: publish
publish:
	@${MAKE} build
	cd ./dist && npm publish

.PHONY: lab
lab:
	@${MAKE} lab-build
	@${MAKE} lab-start

.PHONY: lab-build
lab-build:
	./node_modules/.bin/webpack --config webpack.config.js
	cp lab/index.html www/
	cp dist/jviz.umd.js www/

.PHONY: lab-start
lab-start:
	node ./scripts/lab.js

