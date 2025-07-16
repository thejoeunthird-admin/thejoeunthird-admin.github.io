import { atom } from 'jotai'

export {
  init as initUser,
  userAtom
} from './userAtom'
export {
  init as initRegion,
  regionAtom
} from './regionAtom'
export {
  init as initCategorie,
  categorieAtom
} from './categorie'

export const initUserToken = { data: null, state: false }
export const userTokenAtom = atom(initUserToken)