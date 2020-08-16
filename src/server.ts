import { ApolloServer } from 'apollo-server-express'
import dotenv from 'dotenv'
import express from 'express'
import neo4j from 'neo4j-driver'
// @ts-ignore
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { typeDefs } from './types'
import { schemaDirectives } from './directives'

// Make sure we can use process.env variables
dotenv.config()

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('bigd', 'bierislekker'))

const schema = makeAugmentedSchema({
  typeDefs,
  logger: { log: (e: any) => console.log(e) },
  schemaDirectives
})

const server = new ApolloServer({
  schema,
  context: ({ req }: any) => {
    return {
      driver,
      req,
    }
  },
})

const app = express()
server.applyMiddleware({ app })

const PORT = 5000
app.listen({ port: PORT }, () => console.log(`Now browse to http://localhost:${PORT}${server.graphqlPath}`))
