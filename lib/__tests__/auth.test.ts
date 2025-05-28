describe('Auth Secret Configuration', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('should prioritize AUTH_SECRET over NEXTAUTH_SECRET', () => {
    process.env.AUTH_SECRET = 'auth-secret-value'
    process.env.NEXTAUTH_SECRET = 'nextauth-secret-value'
    
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    expect(secret).toBe('auth-secret-value')
  })

  it('should fallback to NEXTAUTH_SECRET when AUTH_SECRET is not available', () => {
    delete process.env.AUTH_SECRET
    process.env.NEXTAUTH_SECRET = 'nextauth-secret-value'
    
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    expect(secret).toBe('nextauth-secret-value')
  })

  it('should be undefined when neither AUTH_SECRET nor NEXTAUTH_SECRET is available', () => {
    delete process.env.AUTH_SECRET
    delete process.env.NEXTAUTH_SECRET
    
    const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET
    expect(secret).toBeUndefined()
  })
})