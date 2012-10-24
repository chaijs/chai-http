
TESTS = test/*.js
REPORTER = spec

all:
	@rm -f README.md
	@node ./support/readme.js

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--require ./test/bootstrap \
		--reporter $(REPORTER) \
		$(TESTS)

test-cov: lib-cov
	@CHAIHTTP_COV=1 $(MAKE) test REPORTER=html-cov > coverage.html

lib-cov: clean
	@jscoverage lib lib-cov

clean:
	@rm -rf lib-cov
	@rm -f coverage.html

.PHONY: all test lib-cov test-cov clean
