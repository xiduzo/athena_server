import { IsAuthenticatedDirective } from './IsAuthenticatedDirective'
import { HasRoleDirective } from './HasRoleDirective'
import { HasScopeDirective } from './HasScopeDirective'
import { CreatedAtDirective } from './CreatedAtDirective'

export const schemaDirectives = {
  isAuthenticated: IsAuthenticatedDirective,
  hasRole: HasRoleDirective,
  hasScope: HasScopeDirective,
  createdAt: CreatedAtDirective
}