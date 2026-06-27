const mockFindById = jest.fn()
jest.mock('../src/models/user.model', () => ({
  User: { findById: mockFindById },
  ROLES: { ADMIN: 'ADMIN', MEDECIN: 'MEDECIN', ACCUEIL: 'ACCUEIL' },
}))

describe('allowRoles middleware', () => {
  let allowRoles
  let req, res, next

  beforeEach(() => {
    jest.resetModules()
    mockFindById.mockReset()
    const mod = require('../src/middlewares/role.middleware')
    allowRoles = mod.allowRoles
    req = { user: { roleUser: 'ADMIN' } }
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  test('should allow access for allowed role', () => {
    const mw = allowRoles('ADMIN')
    mw(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('should deny access for forbidden role', () => {
    const mw = allowRoles('MEDECIN')
    mw(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if user not authenticated', () => {
    req.user = undefined
    const mw = allowRoles('ADMIN')
    mw(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('requireAdmin should only allow ADMIN', () => {
    const mod = require('../src/middlewares/role.middleware')
    req.user = { roleUser: 'ACCUEIL' }
    mod.requireAdmin(req, res, next)
    expect(res.status).toHaveBeenCalledWith(403)
  })

  test('requireMedecin should allow ADMIN and MEDECIN', () => {
    const mod = require('../src/middlewares/role.middleware')
    req.user = { roleUser: 'MEDECIN' }
    mod.requireMedecin(req, res, next)
    expect(next).toHaveBeenCalled()
  })

  test('requireAccueil should allow ACCUEIL, MEDECIN, ADMIN', () => {
    const mod = require('../src/middlewares/role.middleware')
    req.user = { roleUser: 'ACCUEIL' }
    mod.requireAccueil(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
