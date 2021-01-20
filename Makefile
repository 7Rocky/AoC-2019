test:
	@for d in $(shell ls -d ${PWD}/*/ | grep day_); do \
		cd $${d} && echo '\nTesting:' && pwd && node main.test.js time > output.txt && node main.js >> output.txt && node main.test.js && rm output.txt; \
	done

.PHONY: test
