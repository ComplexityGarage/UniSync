import OAuth from 'oauth-1.0a'
import CryptoJS from 'crypto-js'

const BASE_URL = 'https://apps.usos.uj.edu.pl/services/'

const oauth = new OAuth({
  consumer: {
    key: process.env.USOS_CLIENT_ID || '',
    secret: process.env.USOS_CLIENT_SECRET || ''
  },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64)
  }
})

export const getRequest = async ({
  token,
  secret,
  action
}: {
  token: string
  secret: string
  action: string
}) => {
  const url = `${BASE_URL}${action}`

  const headers = oauth.toHeader(
    oauth.authorize({ url, method: 'GET' }, { key: token, secret })
  )

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...headers
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (err: any) {
    throw err
  }
}
