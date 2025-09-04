import { Role } from '@prisma/client'
import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers/oauth'

export interface UsosProfile extends Record<string, any> {
  id: number
  name: string
  email: string
  staffStatus: number
  studentStatus: number
}

const USOS_ACTIVE_STATUS = 2

export default function UsosProvider<P extends UsosProfile>(
  options: OAuthUserConfig<P>
): OAuthConfig<P> {
  return {
    id: 'usos',
    name: 'USOS',
    type: 'oauth',
    version: '1.0',
    authorization: 'https://apps.usos.uj.edu.pl/services/oauth/authorize',
    accessTokenUrl: 'https://apps.usos.uj.edu.pl/services/oauth/access_token',
    requestTokenUrl:
      'https://apps.usos.uj.edu.pl/services/oauth/request_token?scopes=email',
    profileUrl:
      'https://apps.usos.uj.edu.pl/services/users/user?fields=id|email|first_name|last_name|staff_status|student_status',
    profile(profile: any) {
      return {
        id: profile.id,
        name: `${profile.first_name} ${profile.last_name}`,
        email: profile.email,
        staffStatus: profile.staff_status,
        studentStatus: profile.student_status,
        role:
          profile.staff_status == USOS_ACTIVE_STATUS ? Role.TEACHER : Role.GUEST
      }
    },
    style: {
      logo: 'https://class.codeseals.dev/usos.png',
      bg: '#000',
      text: '#fff'
    },
    options
  }
}
