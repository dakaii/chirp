.PHONY: migration-create migration-up migration-down test test-e2e build start

# Development
up:
	DB_NAME=chirp_db docker-compose up

down:
	docker-compose down -v

# Testing
test:
	DB_NAME=chirp_test_db docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test

test-watch:
	DB_NAME=chirp_test_db docker-compose -f docker-compose.test.yml up --abort-on-container-exit --exit-code-from test-watch

build:
	docker-compose build

migration-create:
	@read -p "Enter migration name: " name; \
	npx mikro-orm migration:create --name $$name

migration-up:
	npx mikro-orm migration:up

migration-down:
	npx mikro-orm migration:down

test-e2e:
	npm run test:e2e

start:
	npm run start:dev
