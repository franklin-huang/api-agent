import axios, { AxiosInstance, AxiosError } from 'axios'
import { PathNotFoundErr, ParamRequiredErr } from './error'

interface OptionsType<T> {
  pathMap: T
  baseURL: string
  withCredentials?: boolean
  defaultErrorHandler?: (reason: AxiosError) => any
}

interface ParamsType {
  [key: string]: string
}
interface GetOptsType {
  params?: ParamsType
  queries?: ParamsType
}
interface PostOptsType {
  params?: ParamsType
  queries?: ParamsType
  body?: any
}

const PARAM_PATTERN = /:[_0-9a-zA-Z]*/g

class Request<T extends { [key: string]: string }> {
  pathMap: T
  request: AxiosInstance
  headers: { [key: string]: string } | undefined

  constructor(options: OptionsType<T>) {
    if (!options.pathMap) throw new Error('pathMap option is required')
    if (!options.baseURL) throw new Error('baseURL option is required')

    this.pathMap = options.pathMap
    this.request = axios.create({
      baseURL: options.baseURL,
      withCredentials: options.withCredentials || false,
    })
  }

  /**
   * Get the raw path from path map with given object key
   *
   * @params {string} pathName - The object key in path map
   */
  _getPath(pathName: keyof T) {
    const path = this.pathMap[pathName]
    if (!path) throw new PathNotFoundErr(pathName as string)

    return path
  }

  /**
   * Transform /caliber/:caliberId to /caliber/1 with the given params
   *
   * @params {string} path - The raw path. eg: /caliber/:caliberId
   * @params {Object} params - URL parameters map. eg: {caliberId}
   */
  static _transformParams(path: string, params: ParamsType = {}) {
    const replaceParam = (accPath: string, paramWithColon: string) => {
      // :caliberId -> caliberId
      const key = paramWithColon.substring(1)
      if (!params[key]) {
        throw new ParamRequiredErr({ paramName: key, pathParams: params })
      }

      return accPath.replace(paramWithColon, params[key].toString())
    }

    const matchedParams = path.match(PARAM_PATTERN)

    if (matchedParams?.length) {
      return matchedParams.reduce(replaceParam, path)
    }

    return path
  }

  /**
   * @params {string} pathName - The object key in path map
   * @params {Object} params - URL parameters map
   */
  _parsePath(pathName: keyof T, params: ParamsType = {}) {
    const path = this._getPath(pathName)
    const encodedParams = Object.entries(params).reduce(
      (acc, [key, value]) => ({ ...acc, [key]: encodeURIComponent(value) }),
      {}
    )

    return Request._transformParams(path, encodedParams)
  }

  /**
   * Get a random number from 0 to 1m
   */
  _newXSelectorHeaderVal = () => Math.round(Math.random() * 1000000)

  setHeaders = (headers: { [key: string]: string }) => (this.headers = headers)

  /**
   * Equivalent to REST get
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'queries'
   */
  get(pathName: keyof T, opts: GetOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request.get(path, { headers: this.headers, params: opts.queries })
  }

  /**
   * Equivalent to REST post
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  post(pathName: keyof T, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts && opts.params)

    return this.request.post(path, opts && opts.body, { headers: this.headers, params: opts.queries })
  }

  /**
   * Equivalent to REST put
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  put(pathName: keyof T, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request.put(path, opts.body, { headers: this.headers, params: opts.queries })
  }

  /**
   * Equivalent to REST delete
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  delete(pathName: keyof T, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request.delete(path, {
      data: opts.body,
      params: opts.queries,
      headers: this.headers,
    })
  }
}

export default Request
