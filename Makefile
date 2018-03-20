YARN := node_modules/.bin/yarn

.PHONY: default
default: all

.PHONY: all
all: build/manifest.json

.PHONY: dev
dev: node_modules/.uptodate clean
	gulp build
	gulp watch

## Remove build artifacts
.PHONY: clean
clean:
	rm -f node_modules/.uptodate
	rm -rf build

## Run test suite
.PHONY: test
test: node_modules/.uptodate
	$(YARN) test

.PHONY: lint
lint: node_modules/.uptodate
	$(YARN) run lint

.PHONY: docs
docs:
	cd docs && make livehtml

################################################################################

build/manifest.json: node_modules/.uptodate
	$(YARN) run build

node_modules/.uptodate: package.json yarn.lock
	$(YARN) run deps 2>/dev/null || $(YARN) install
	@touch $@
