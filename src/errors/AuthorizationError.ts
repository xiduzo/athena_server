import { ApolloError, ErrorConfig } from 'apollo-errors'

interface IAuthorizationError {
  baseConfig: ErrorConfig
}

export class AuthorizationError implements IAuthorizationError {
  baseConfig: ErrorConfig = {} as ErrorConfig
  constructor(config?: ErrorConfig) {
    throw new ApolloError(
      'You are not authorized for this resource.',
      config || this.baseConfig,
      config || this.baseConfig
    )
  }
}
