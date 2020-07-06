import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { PathNotFoundErr, ParamRequiredErr } from './error'

interface OptionsType {
  pathMap: { [key: string]: string }
  baseURL: string
  withCredentials?: boolean
}

interface ParamsType {
  [key: string]: string | number
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

class Request {
  pathMap: { [key: string]: string }
  request: AxiosInstance
  onError: ((reason: any) => AxiosResponse) | null = null
  headers: { [key: string]: string } | null = null

  constructor(options: OptionsType) {
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
  _getPath(pathName: string) {
    const path = this.pathMap[pathName]
    if (!path) throw new PathNotFoundErr(pathName)

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
  _parsePath(pathName: string, params: ParamsType = {}) {
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

  /**
   * _handleErr: will regenerate the x-selector header value if x-selector is required
   *             and the request fails.
   */
  _handleErr = (err: AxiosResponse) => {
    if (this.onError) return this.onError(err)
    return Promise.reject(err)
  }

  setHeaders = (headers: { [key: string]: string }) => (this.headers = headers)

  /**
   * Equivalent to REST get
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'queries'
   */
  get(pathName: string, opts: GetOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request.get(path, { headers: this.headers, params: opts.queries }).catch(this._handleErr)
  }

  /**
   * Equivalent to REST post
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  post(pathName: string, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts && opts.params)

    return this.request
      .post(path, opts && opts.body, { headers: this.headers, params: opts.queries })
      .catch(this._handleErr)
  }

  /**
   * Equivalent to REST put
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  put(pathName: string, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request.put(path, opts.body, { headers: this.headers, params: opts.queries }).catch(this._handleErr)
  }

  /**
   * Equivalent to REST delete
   *
   * @param {string} pathName - The object key in path map
   * @param {Object} opts - Only accept 'params' and 'body'
   */
  delete(pathName: string, opts: PostOptsType = {}) {
    const path = this._parsePath(pathName, opts.params)

    return this.request
      .delete(path, {
        data: opts.body,
        params: opts.queries,
        headers: this.headers,
      })
      .catch(this._handleErr)
  }
}

export default Request
