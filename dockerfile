FROM node:latest

WORKDIR /usr/src/app

COPY . .

RUN npm ci
RUN npm run build

COPY dist/ ./dist/

EXPOSE 5000

CMD ["node", "dist/server.js"]

# docker run --name athena_neo4j -p 7474:7474 -p7687:7687 -d -v $HOME/neo4j/data:/data -v $HOME/neo4j/logs:/logs -v $HOME/neo4j/import:/var/lib/neo4j/import -v $HOME/neo4j/plugins:/plugins --env NEO4J_AUTH=neo4j/test --env NEO4J_dbms_connector_https_advertised__address="localhost:7473" --env NEO4J_dbms_connector_http_advertised__address="localhost:7474" --env NEO4J_dbms_connector_bolt_advertised__address="localhost:7687" neo4j:latest