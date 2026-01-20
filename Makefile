.PHONY: run
run:
	pnpm run dev

.PHONY: docker_build
docker_build:
	docker build -t family-assistant-ui:latest --platform linux/amd64 .


.PHONY: docker_run
docker_run:
	docker run --rm -it -p 4173:4173 family-assistant-ui:latest
