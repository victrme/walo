import { User } from 'firebase/auth'

export type UserInfos = Pick<User, 'displayName' | 'photoURL'> | null
