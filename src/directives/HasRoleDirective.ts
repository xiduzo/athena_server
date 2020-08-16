import { SchemaDirectiveVisitor } from 'apollo-server-express'
import {
  DirectiveLocation,
  GraphQLDirective,
  GraphQLField,
  GraphQLList,
  GraphQLObjectType,
  GraphQLResolveInfo,
  GraphQLFieldResolver,
} from 'graphql'
import { AuthorizationError } from '../errors/AuthorizationError'
import { INameToValueMap } from '../interfaces/INameToValueMap'
import { arrayHasMatchesWith } from '../utils/arrayHasMatchesWith'
import { verifyAndDecodeToken } from '../utils/verifyAndDecodeToken'

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
  expectedRoles: any
) => {
  const decoded = verifyAndDecodeToken({ context }) as INameToValueMap

  const { AUTH_DIRECTIVES_ROLE_KEY } = process.env

  const keysToCheck = ['cognito:groups', 'Roles', 'roles', 'Role', 'role']
  if (AUTH_DIRECTIVES_ROLE_KEY) keysToCheck.push(AUTH_DIRECTIVES_ROLE_KEY)

  // FIXME: override with env var
  const roles = keysToCheck.filter((item) => decoded[item])

  if (!arrayHasMatchesWith(expectedRoles, roles)) {
    throw new AuthorizationError({
      message: 'You are not authorized for this resource',
    })
  }

  return next && next(result, args, { ...context, user: decoded }, info)
}

export class HasRoleDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: any, schema: any) {
    return new GraphQLDirective({
      name: 'hasRole',
      locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT],
      args: {
        roles: {
          type: new GraphQLList(schema.getType('Role')),
          defaultValue: 'reader',
        },
      },
    })
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    const expectedRoles = this.args.roles
    const next = field.resolve

    field.resolve = (result: any, args: any, context: any, info: GraphQLResolveInfo) =>
      resolveRequest(result, args, context, info, next, expectedRoles)
  }

  visitObject(obj: GraphQLObjectType) {
    const fields = obj.getFields()
    const expectedRoles = this.args.roles

    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const next = field.resolve

      field.resolve = (result: any, args: any, context: any, info: GraphQLResolveInfo) =>
        resolveRequest(result, args, context, info, next, expectedRoles)
    })
  }
}
