/// <reference types="jest" />
declare const axiosMock: () => {
    get: jest.Mock<Promise<void>, []>;
    put: jest.Mock<Promise<void>, []>;
    post: jest.Mock<Promise<void>, []>;
    mockClear: () => void;
    delete: jest.Mock<Promise<void>, []>;
};
export default axiosMock;
