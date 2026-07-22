const mockAuthService = {
  login: jest.fn(),
  register: jest.fn(),
  getAllUsers: jest.fn(),
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  changePassword: jest.fn(),
}

jest.mock('../src/services/auth.service', () => mockAuthService)
jest.mock('../src/utils/generateToken', () => ({ generateToken: jest.fn(() => 'mocked-token') }))

describe('User Controller', () => {
  let controller
  let req, res

  beforeEach(() => {
    jest.resetModules()
    controller = require('../src/controllers/user.controller')
    req = { body: {}, params: {}, query: {}, user: { _id: 'admin1' } }
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  })

  test('login should return 200 with token on success', async () => {
    mockAuthService.login.mockResolvedValue({ user: { name: 'Doc' }, token: 'abc' })
    req.body = { emailUser: 'doc@test.com', passwordUser: '1234' }
    await controller.login(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('login should return 401 on error', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Invalid credentials'))
    req.body = { emailUser: 'doc@test.com', passwordUser: 'wrong' }
    await controller.login(req, res)
    expect(res.status).toHaveBeenCalledWith(401)
  })

  test('register should return 201 on success', async () => {
    mockAuthService.register.mockResolvedValue({ id: 'u1', nameUser: 'New' })
    req.body = { nameUser: 'New', emailUser: 'new@test.com', passwordUser: 'password123' }
    await controller.register(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('registerAdmin should return 201 on success', async () => {
    mockAuthService.register.mockResolvedValue({ id: 'a1', nameUser: 'Admin' })
    req.body = { nameUser: 'Admin', emailUser: 'admin@test.com', passwordUser: 'adminpass1' }
    await controller.registerAdmin(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  test('getAllUsers should return users array', async () => {
    mockAuthService.getAllUsers.mockResolvedValue([{ id: 'u1' }])
    await controller.getAllUsers(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('getUserById should return a user', async () => {
    mockAuthService.getUserById.mockResolvedValue({ id: 'u1', nameUser: 'User' })
    req.params.id = 'u1'
    await controller.getUserById(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('updateUser should return updated user', async () => {
    mockAuthService.updateUser.mockResolvedValue({ id: 'u1', nameUser: 'Updated' })
    req.params.id = 'u1'
    req.body = { nameUser: 'Updated' }
    await controller.updateUser(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('deleteUser should return success message', async () => {
    mockAuthService.deleteUser.mockResolvedValue({})
    req.params.id = 'u1'
    await controller.deleteUser(req, res)
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }))
  })

  test('changePassword should return 200 on success', async () => {
    mockAuthService.changePassword.mockResolvedValue({})
    req.body = { currentPassword: 'old', newPassword: 'NewPass123!' }
    req.user = { _id: 'u1' }
    await controller.changePassword(req, res)
    expect(res.status).toHaveBeenCalledWith(200)
  })
})
