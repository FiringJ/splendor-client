import { trackPageview } from '../pageview';

const SUPABASE_URL = 'https://example.supabase.co';
const ANON_KEY = 'test-anon-key';

describe('trackPageview', () => {
  const originalFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = SUPABASE_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ANON_KEY;
    fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 201 });
    global.fetch = fetchMock;
    localStorage.clear();
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      get: () => 'https://ref.example/',
    });
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      get: () => 'TestAgent/1.0',
    });
  });

  afterEach(() => {
    global.fetch = originalFetch;
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    jest.restoreAllMocks();
  });

  it('POSTs to /rest/v1/pageviews with path, referrer, user_agent, session_id', async () => {
    await trackPageview('/play');

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`${SUPABASE_URL}/rest/v1/pageviews`);
    expect(init.method).toBe('POST');

    const body = JSON.parse(String(init.body)) as Record<string, string>;
    expect(body).toEqual(
      expect.objectContaining({
        path: '/play',
        referrer: 'https://ref.example/',
        user_agent: 'TestAgent/1.0',
        session_id: expect.any(String),
      }),
    );
    expect(body.session_id.length).toBeGreaterThan(0);
  });

  it('swallows fetch errors and does not throw', async () => {
    fetchMock.mockRejectedValue(new Error('network down'));
    await expect(trackPageview('/')).resolves.toBeUndefined();
  });

  it('skips when env is missing', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    await trackPageview('/');
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
