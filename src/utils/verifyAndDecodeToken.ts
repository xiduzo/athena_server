import * as jwt from 'jsonwebtoken'
import { AuthorizationError } from '../errors/AuthorizationError'

export const verifyAndDecodeToken = ({ context }: { context: any }) => {
  const { req } = context
  const { headers, cookies } = req
  if (!headers && !cookies) throw new AuthorizationError({ message: 'No authorization token found.' })

  let headerToken = ''

  if (headers) {
    const { authorization, Authorization } = headers
    headerToken = authorization ? authorization : Authorization ? Authorization : ''
  }

  if (cookies) {
    const { token } = cookies

    headerToken = token ? token : ''
  }

  if (!headerToken) throw new AuthorizationError({ message: 'No authorization token found.' })

  try {
    const id_token = headerToken.replace('Bearer ', '')
    const { JWT_SECRET, JWT_NO_VERIFY } = process.env

    if (!JWT_SECRET && JWT_NO_VERIFY) {
      return jwt.decode(id_token)
    }

    return jwt.verify(id_token, JWT_SECRET || '', {
      algorithms: [ 'HS256', 'RS256' ],
    })
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthorizationError({
        message: 'Your token is expired',
      })
    }

    throw new AuthorizationError()
  }
}
