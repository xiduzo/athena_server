import { ApolloServer } from 'apollo-server-express'
import * as dotenv from 'dotenv'
import * as express from 'express'
import neo4j from 'neo4j-driver'
// @ts-ignore
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import { HasRoleDirective } from './directives/HasRoleDirective'
import { HasScopeDirective } from './directives/HasScopeDirective'
import { IsAuthenticatedDirective } from './directives/IsAuthenticatedDirective'
import { typeDefs } from './types'
import { CreatedAtDirective } from './directives/CreatedAtDirective'

// Make sure we can use process.env variables
dotenv.config()

const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('athena', 'bierislekker'))

const schema = makeAugmentedSchema({
  typeDefs,
  logger: { log: (e: any) => console.log(e) },
  schemaDirectives: {
    isAuthenticated: IsAuthenticatedDirective,
    hasRole: HasRoleDirective,
    hasScope: HasScopeDirective,
    createdAt: CreatedAtDirective,
  },
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
