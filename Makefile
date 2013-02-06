coffeeDir = ./node_modules/coffee-script/bin/coffee

test:
	$(coffeeDir) -o ./tests/ ./tests/spec/
	#$(coffeeDir) -o ./lib/ ./src/
	grunt test

.PHONY: test
