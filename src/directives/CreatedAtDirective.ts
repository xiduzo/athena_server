import { SchemaDirectiveVisitor } from 'apollo-server-express'
import { GraphQLDirective, DirectiveLocation, GraphQLField, GraphQLObjectType, GraphQLResolveInfo } from 'graphql'
import { verifyAndDecodeToken } from '../utils/verifyAndDecodeToken'
import { INameToValueMap } from '../interfaces/INameToValueMap'
import { arrayHasMatchesWith } from '../utils/arrayHasMatchesWith'
import { AuthorizationError } from '../errors/AuthorizationError'

export class CreatedAtDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: any, schema: any) {
    return new GraphQLDirective({
      name: 'createdAt',
      locations: [ DirectiveLocation.FIELD_DEFINITION ],
    })
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    // const expectedRoles = this.args.roles
    const next = field.resolve

    field.resolve = (result: any, args: any, context: any, info: GraphQLResolveInfo) => {
      const decoded = verifyAndDecodeToken({ context }) as INameToValueMap

      //   const { AUTH_DIRECTIVES_ROLE_KEY } = process.env

      //   const keysToCheck = [ 'cognito:groups', 'Roles', 'roles', 'Role', 'role' ]
      //   if (AUTH_DIRECTIVES_ROLE_KEY) keysToCheck.push(AUTH_DIRECTIVES_ROLE_KEY)

      //   // FIXME: override with env var
      //   const roles = keysToCheck.filter((item) => decoded[item])

      //   if (arrayHasMatchesWith(expectedRoles, roles)) {
      //     return next && next(result, args, { ...context, user: decoded }, info)
      //   }
      console.log(`info`)
      console.log(info)

      if (!result[field.name]) result[field.name] = new Date()

      return next && next(result, args, { ...context, user: decoded }, info)

      throw new AuthorizationError({
        message: 'You are not authorized for this resource',
      })
    }
  }
}
