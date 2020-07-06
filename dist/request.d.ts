import { AxiosInstance, AxiosResponse } from 'axios';
interface OptionsType {
    pathMap: {
        [key: string]: string;
    };
    baseURL: string;
    withCredentials?: boolean;
}
interface ParamsType {
    [key: string]: string | number;
}
interface GetOptsType {
    params?: ParamsType;
    queries?: ParamsType;
}
interface PostOptsType {
    params?: ParamsType;
    queries?: ParamsType;
    body?: any;
}
declare class Request {
    pathMap: {
        [key: string]: string;
    };
    request: AxiosInstance;
    onError: ((reason: any) => AxiosResponse) | null;
    headers: {
        [key: string]: string;
    } | null;
    constructor(options: OptionsType);
    /**
     * Get the raw path from path map with given object key
     *
     * @params {string} pathName - The object key in path map
     */
    _getPath(pathName: string): string;
    /**
     * Transform /caliber/:caliberId to /caliber/1 with the given params
     *
     * @params {string} path - The raw path. eg: /caliber/:caliberId
     * @params {Object} params - URL parameters map. eg: {caliberId}
     */
    static _transformParams(path: string, params?: ParamsType): string;
    /**
     * @params {string} pathName - The object key in path map
     * @params {Object} params - URL parameters map
     */
    _parsePath(pathName: string, params?: ParamsType): string;
    /**
     * Get a random number from 0 to 1m
     */
    _newXSelectorHeaderVal: () => number;
    /**
     * _handleErr: will regenerate the x-selector header value if x-selector is required
     *             and the request fails.
     */
    _handleErr: (err: AxiosResponse<any>) => AxiosResponse<any> | Promise<never>;
    setHeaders: (headers: {
        [key: string]: string;
    }) => {
        [key: string]: string;
    };
    /**
     * Equivalent to REST get
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'queries'
     */
    get(pathName: string, opts?: GetOptsType): Promise<AxiosResponse<any>>;
    /**
     * Equivalent to REST post
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    post(pathName: string, opts?: PostOptsType): Promise<AxiosResponse<any>>;
    /**
     * Equivalent to REST put
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    put(pathName: string, opts?: PostOptsType): Promise<AxiosResponse<any>>;
    /**
     * Equivalent to REST delete
     *
     * @param {string} pathName - The object key in path map
     * @param {Object} opts - Only accept 'params' and 'body'
     */
    delete(pathName: string, opts?: PostOptsType): Promise<AxiosResponse<any>>;
}
export default Request;
