const mockVerifyToken = jest.fn()
jest.mock('../src/utils/generateToken', () => ({ verifyToken: mockVerifyToken }))

const mockFindById = jest.fn()
jest.mock('../src/models/user.model', () => ({ User: { findById: mockFindById } }))

describe('Auth Middleware', () => {
  let authenticate
  let req, res, next

  beforeEach(() => {
    jest.resetModules()
    mockVerifyToken.mockReset()
    mockFindById.mockReset()
    authenticate = require('../src/middlewares/auth.middleware')
    req = { headers: {} }
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
    next = jest.fn()
  })

  test('should return 401 if no authorization header', async () => {
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if not Bearer scheme', async () => {
    req.headers.authorization = 'Basic token123'
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if token is invalid (JsonWebTokenError)', async () => {
    req.headers.authorization = 'Bearer bad-token'
    const err = new Error('invalid')
    err.name = 'JsonWebTokenError'
    mockVerifyToken.mockImplementation(() => { throw err })
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if token expired', async () => {
    req.headers.authorization = 'Bearer expired-token'
    const err = new Error('expired')
    err.name = 'TokenExpiredError'
    mockVerifyToken.mockImplementation(() => { throw err })
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 500 on other errors', async () => {
    req.headers.authorization = 'Bearer bad-token'
    mockVerifyToken.mockImplementation(() => { throw new Error('unexpected') })
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(next).not.toHaveBeenCalled()
  })

  test('should return 401 if user not found in DB', async () => {
    req.headers.authorization = 'Bearer valid-token'
    mockVerifyToken.mockReturnValue({ id: 'abc123' })
    mockFindById.mockResolvedValue(null)
    await authenticate(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('should set req.user and call next on success', async () => {
    const fakeUser = { _id: 'abc123', roleUser: 'MEDECIN', emailUser: 'doc@test.com' }
    req.headers.authorization = 'Bearer good-token'
    mockVerifyToken.mockReturnValue({ id: 'abc123' })
    mockFindById.mockResolvedValue(fakeUser)
    await authenticate(req, res, next)
    expect(req.user).toBe(fakeUser)
    expect(req.token).toBe('good-token')
    expect(next).toHaveBeenCalled()
  })
})
