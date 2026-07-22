const mockHospital = {
  find: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  findByIdAndUpdate: jest.fn(),
  findByIdAndDelete: jest.fn(),
}

jest.mock('../src/models/hospital.model', () => ({ Hospital: mockHospital }))

describe('Hospital Controller', () => {
  let controller
  let req, res

  beforeEach(() => {
    jest.resetModules()
    mockHospital.find.mockReset()
    mockHospital.findById.mockReset()
    mockHospital.create.mockReset()
    mockHospital.findByIdAndUpdate.mockReset()
    mockHospital.findByIdAndDelete.mockReset()

    controller = require('../src/controllers/hospital.controller')
    req = { body: {}, params: {}, query: {}, user: { id: 'admin1' } }
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() }
  })

  test('getAll should return hospitals', async () => {
    const hospitals = [{ id: 1, nameHospital: 'Central' }]
    mockHospital.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(hospitals) })
    await controller.getAll(req, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: hospitals })
    )
  })

  test('getAll should filter by search query', async () => {
    const sortFn = jest.fn().mockResolvedValue([])
    mockHospital.find.mockReturnValue({ sort: sortFn })
    req.query.search = 'Central'
    await controller.getAll(req, res)
    expect(mockHospital.find).toHaveBeenCalledWith({
      nameHospital: { $regex: 'Central', $options: 'i' },
    })
  })

  test('getById should return a hospital', async () => {
    const hospital = { id: 1, nameHospital: 'Central' }
    mockHospital.findById.mockResolvedValue(hospital)
    req.params.id = '1'
    await controller.getById(req, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: hospital })
    )
  })

  test('getById should return 404 if not found', async () => {
    mockHospital.findById.mockResolvedValue(null)
    req.params.id = 'nonexistent'
    await controller.getById(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('create should return 201', async () => {
    mockHospital.create.mockResolvedValue({ id: 1, nameHospital: 'New' })
    req.body = { nameHospital: 'New' }
    await controller.create(req, res)
    expect(res.status).toHaveBeenCalledWith(201)
  })

  test('update should return updated hospital', async () => {
    mockHospital.findByIdAndUpdate.mockResolvedValue({ id: 1, nameHospital: 'Updated' })
    req.params.id = '1'
    req.body = { nameHospital: 'Updated', servicesHospital: [] }
    await controller.update(req, res)
    expect(mockHospital.findByIdAndUpdate).toHaveBeenCalledWith(
      '1',
      { nameHospital: 'Updated', servicesHospital: [] },
      { new: true, runValidators: true }
    )
  })

  test('update should return 404 if not found', async () => {
    mockHospital.findByIdAndUpdate.mockResolvedValue(null)
    req.params.id = '1'
    req.body = { nameHospital: 'Updated' }
    await controller.update(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })

  test('delete should return success', async () => {
    mockHospital.findByIdAndDelete.mockResolvedValue({ id: 1 })
    req.params.id = '1'
    await controller.delete(req, res)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true })
    )
  })

  test('delete should return 404 if not found', async () => {
    mockHospital.findByIdAndDelete.mockResolvedValue(null)
    req.params.id = '1'
    await controller.delete(req, res)
    expect(res.status).toHaveBeenCalledWith(404)
  })
})
