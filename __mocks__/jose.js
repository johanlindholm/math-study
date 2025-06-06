// Mock for jose library used by next-auth
module.exports = {
  jwtVerify: jest.fn().mockResolvedValue({
    payload: {
      sub: 'user-id',
      name: 'Test User',
      email: 'test@example.com'
    }
  }),
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token')
  })),
  createRemoteJWKSet: jest.fn(),
  importJWK: jest.fn(),
  importX509: jest.fn(),
  importPKCS8: jest.fn(),
  importSPKI: jest.fn()
};