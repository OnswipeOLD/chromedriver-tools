DEFAULT:
	make test

test:
	./node_modules/.bin/mocha $(ARGS) test/spec.*.js

test_watch:
	DEBUG="chromedriver*,test*" ARGS="-w -G" make test

.PHONY: \
	DEFAULT \
	test \