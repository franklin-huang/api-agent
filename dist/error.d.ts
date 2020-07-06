declare class PathNotFoundErr extends Error {
    constructor(pathName?: string, ...params: any[]);
}
interface ParamRequiredErrParam {
    paramName: string;
    pathParams: object;
}
declare class ParamRequiredErr extends Error {
    constructor({ paramName, pathParams }: ParamRequiredErrParam, ...params: any[]);
}
export { PathNotFoundErr, ParamRequiredErr };
