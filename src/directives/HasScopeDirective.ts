import { SchemaDirectiveVisitor } from 'apollo-server-express'
import {
  GraphQLDirective,
  DirectiveLocation,
  GraphQLList,
  GraphQLString,
  GraphQLField,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLFieldResolver,
} from 'graphql'
import { verifyAndDecodeToken } from '../utils/verifyAndDecodeToken'
import { arrayHasMatchesWith } from '../utils/arrayHasMatchesWith'
import { AuthorizationError } from '../errors/AuthorizationError'
import { INameToValueMap } from '../interfaces/INameToValueMap'

const resolveRequest = (
  result: any,
  args: any,
  context: any,
  info: GraphQLResolveInfo,
  next:
    | GraphQLFieldResolver<
        any,
        any,
        {
          [key: string]: any
        }
      >
    | undefined,
  expectedScopes: any
) => {
  const decoded = verifyAndDecodeToken({ context }) as INameToValueMap

  // FIXME: override w/ env var
  const keysToCheck = ['Scopes', 'scopes', 'Scope', 'scope']
  const scopes = keysToCheck.filter((item) => decoded[item])

  if (arrayHasMatchesWith(expectedScopes, scopes)) {
    return next && next(result, args, { ...context, user: decoded }, info)
  }

  throw new AuthorizationError({
    message: 'You are not authorized for this resource',
  })
}

export class HasScopeDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: any, schema: any) {
    return new GraphQLDirective({
      name: 'hasScope',
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      args: {
        scopes: {
          type: new GraphQLList(GraphQLString),
          defaultValue: 'none:read',
        },
      },
    })
  }

  // used for example, with Query and Mutation fields
  visitFieldDefinition(field: GraphQLField<any, any>) {
    const expectedScopes: string[] = this.args.scopes
    const next = field.resolve

    // wrap resolver with auth check
    field.resolve = (result: any, args: any, context: any, info: GraphQLResolveInfo) =>
      resolveRequest(result, args, context, info, next, expectedScopes)
  }

  visitObject(obj: GraphQLObjectType) {
    const fields = obj.getFields()
    const expectedScopes = this.args.scopes

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const next = field.resolve
      field.resolve = (result: any, args: any, context: any, info: GraphQLResolveInfo) =>
        resolveRequest(result, args, context, info, next, expectedScopes)
    })
  }
}
