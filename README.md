# SWAPI Caching Server

This project is a caching server for the SWAPI (Star Wars API) to enhance its features for high school students' research projects.

## Features

- Caches data from SWAPI to reduce latency and improve performance.
- Provides a RESTful API with caching capabilities for various Star Wars resources.

## Setup

1. Install dependencies: `npm install`
2. Run the server: `npm start`

## Endpoints

- `/api/:resource`: Get data for a specific resource (e.g., `/api/people`, `/api/films`).

## Optional Features

### Cron Job

A cron job is set up to periodically update the cached data.

### Unit Tests

Run unit tests using: `npm test`
for further testing all API
1. /swapi/search:
curl -X GET 'http://localhost:3000/swapi/search?resource=people&query=luke' | jq

2. /swapi/sort:
curl -X GET 'http://localhost:3000/swapi/sort?resource=people&attribute=name&order=asc' | jq

3. /swapi/:resource:
curl -X GET 'http://localhost:3000/swapi/people?page=1&items_per_page=10' | jq


4. /swapi/:resource/:id:
curl -X GET 'http://localhost:3000/swapi/people/1' | jq

5. /swapi/people:
curl -X GET 'http://localhost:3000/swapi/people/1' | jq

6. /swapi/people/:id:
curl -X GET 'http://localhost:3000/swapi/people/1' | jq

7. /swapi/planets/:id:
curl -X GET 'http://localhost:3000/swapi/planets/1' | jq

8. /swapi/species/:id:
curl -X GET 'http://localhost:3000/swapi/species/1' | jq

9. /swapi/starships/:id:
curl -X GET 'http://localhost:3000/swapi/starships/1' | jq

10. /test:
curl -X GET 'http://localhost:3000/test' | jq






### Linting

Lint your code using: `npm run lint`


## License

This project is licensed under the MIT License
