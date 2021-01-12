test:
	@for d in $(shell ls -d ${PWD}/*/ | grep day_); do \
		cd $${d} && echo '\nTesting: ' && pwd && npx jest --rootDir . --silent ; \
	done

.PHONY: test
