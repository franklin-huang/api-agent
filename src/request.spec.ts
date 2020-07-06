import axiosMock from './test/axios_mock'
import ApiRequest from './request'
import { PathNotFoundErr, ParamRequiredErr } from './error'

const pathMap = {
  caliber: '/caliber',
  caliberById: '/caliber/:caliberId',
  product: '/category/:cat_id/product/:product_id',
}

describe('Libraries - Api request', () => {
  describe('Methods', () => {
    const apiCall = new ApiRequest({ pathMap, baseURL: 'testing.com' })
    apiCall.request = axiosMock()

    afterEach(() => {
      apiCall.request.mockClear()
    })

    describe('_getPath', () => {
      test('should throw path not found error', () => {
        const failedFn = () => apiCall._getPath('testPath')

        expect(failedFn).toThrow(PathNotFoundErr)
      })

      test('should return a path if pathname is matched', () => {
        expect(apiCall._getPath('caliber')).toEqual(pathMap.caliber)
      })
    })

    describe('_transformParams', () => {
      test('should throw params are missing error', () => {
        const failedFn = () => {
          ApiRequest._transformParams(pathMap.caliberById, {
            notThisParam: 'test',
          })
        }

        expect(failedFn).toThrow(ParamRequiredErr)
      })

      test('should return path if it does not require to parse key', () => {
        const path = ApiRequest._transformParams(pathMap.caliber, {
          ignoreThisParam: 'test',
        })

        expect(path).toEqual(pathMap.caliber)
      })

      test('should replace the params in the path', () => {
        const path = ApiRequest._transformParams(pathMap.caliberById, {
          caliberId: 1,
        })
        const path1 = ApiRequest._transformParams(pathMap.product, {
          cat_id: 1,
          product_id: 2,
        })

        expect(path).toEqual('/caliber/1')
        expect(path1).toEqual('/category/1/product/2')
      })
    })

    describe('_parsePath', () => {
      test('should get path from path map and transform to actual path', () => {
        const path = apiCall._parsePath('caliberById', {
          caliberId: 1,
        })
        const path1 = apiCall._parsePath('product', {
          cat_id: 1,
          product_id: 2,
        })

        expect(path).toEqual('/caliber/1')
        expect(path1).toEqual('/category/1/product/2')
      })
    })

    describe('get', () => {
      test('should transform the path with the given param and pass queries to axios get method', () => {
        apiCall.get('caliber')
        apiCall.get('caliberById', {
          params: { caliberId: 1 },
          queries: { startsWith: 'ok' },
        })

        expect(apiCall.request.get.mock.calls[0][0]).toBe('/caliber')
        expect(apiCall.request.get.mock.calls[1][0]).toBe('/caliber/1')
        expect(apiCall.request.get.mock.calls[1][1].params).toEqual({
          startsWith: 'ok',
        })
      })
    })

    describe('post', () => {
      test('should transform the path with the given param and pass body to axios post method', () => {
        apiCall.post('caliber', { body: { brand: 'glock' } })
        apiCall.post('caliberById', {
          params: { caliberId: 1 },
          body: { brand: 'glock' },
        })

        expect(apiCall.request.post.mock.calls[0][0]).toBe('/caliber')
        expect(apiCall.request.post.mock.calls[0][1]).toEqual({
          brand: 'glock',
        })
      })
    })

    describe('put', () => {
      test('should transform the path with the given param and pass body to axios put method', () => {
        apiCall.put('caliber', { body: { brand: 'glock' } })
        apiCall.put('caliberById', {
          params: { caliberId: 1 },
          body: { brand: 'glock' },
        })

        expect(apiCall.request.put.mock.calls[0][0]).toBe('/caliber')
        expect(apiCall.request.put.mock.calls[0][1]).toEqual({
          brand: 'glock',
        })
      })
    })

    describe('delete', () => {
      test('should transform the path with the given params and pass path to axios delete method', () => {
        apiCall.delete('caliber')
        apiCall.delete('caliberById', { params: { caliberId: 1 } })

        expect(apiCall.request.delete.mock.calls[0][0]).toBe('/caliber')
        expect(apiCall.request.delete.mock.calls[1][0]).toBe('/caliber/1')
      })
    })
  })
})
