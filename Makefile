.PHONY: run
run:
	pnpm run dev --port 3001

.PHONY: preview
preview:
	pnpm run preview --port 3001


.PHONY: docker_build
docker_build:
	docker build -t family-assistant-ui:latest --platform linux/amd64 .


.PHONY: docker_run
docker_run:
	docker run --rm -it -p 4173:4173 family-assistant-ui:latest
