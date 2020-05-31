import { DirectiveLocation, GraphQLDirective, GraphQLField, GraphQLObjectType } from 'graphql'
import { SchemaDirectiveVisitor } from 'graphql-tools'
import { verifyAndDecodeToken } from '../utils/verifyAndDecodeToken'

export class IsAuthenticatedDirective extends SchemaDirectiveVisitor {
  static getDirectiveDeclaration(directiveName: any, schema: any) {
    return new GraphQLDirective({
      name: 'isAuthenticated',
      locations: [ DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT ],
    })
  }

  visitObject(obj: GraphQLObjectType) {
    const fields = obj.getFields()

    // If @isAuthenticated is put on a type definition
    // We need to check each field for authentications (?)
    // Not sure yet, xiduzo - 15/03/2020
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName]
      const next = field.resolve

      field.resolve = (result: any, args: any, context: any, info: any) => {
        const decoded = verifyAndDecodeToken({ context }) // will throw error if not valid (signed) jwt
        return next && next(result, args, { ...context, user: decoded }, info)
      }
    })
  }

  visitFieldDefinition(field: GraphQLField<any, any>) {
    const next = field.resolve

    field.resolve = (result: any, args: any, context: any, info: any) => {
      const decoded = verifyAndDecodeToken({ context }) // will throw error if not valid (signed) jwt
      return next && next(result, args, { ...context, user: decoded }, info)
    }
  }
}
