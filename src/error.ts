class PathNotFoundErr extends Error {
  constructor(pathName = '', ...params: any[]) {
    super(...params)

    // eslint-disable-next-line
    // @ts-ignore
    if (Error.captureStackTrace) Error.captureStackTrace(this, PathNotFoundErr)

    this.name = 'PathNotFoundError'
    this.message = pathName ? `Path not found from the given path name: ${pathName}` : `Path name is not provided`
  }
}

interface ParamRequiredErrParam {
  paramName: string
  pathParams: object
}

class ParamRequiredErr extends Error {
  constructor({ paramName, pathParams }: ParamRequiredErrParam, ...params: any[]) {
    super(...params)

    // eslint-disable-next-line
    // @ts-ignore
    if (Error.captureStackTrace) Error.captureStackTrace(this, ParamRequiredErr)

    this.name = 'ParamRequiredError'
    this.message = `
      Param [${paramName}] is required. And you are passing ${JSON.stringify(pathParams)}
    `
  }
}

export { PathNotFoundErr, ParamRequiredErr }
