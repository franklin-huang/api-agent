const axiosMock = () => {
  const get = jest.fn(() => Promise.resolve())
  const post = jest.fn(() => Promise.resolve())
  const put = jest.fn(() => Promise.resolve())
  const _delete = jest.fn(() => Promise.resolve())

  const mockClear = () => {
    get.mockClear()
    post.mockClear()
    put.mockClear()
    _delete.mockClear()
  }

  return {
    get,
    put,
    post,
    mockClear,
    delete: _delete,
  }
}

export default axiosMock
