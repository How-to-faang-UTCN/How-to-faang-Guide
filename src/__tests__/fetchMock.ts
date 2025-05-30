// Mock Response class for tests since jsdom doesn't include this
class MockResponse {
    public status: number;
    public ok: boolean;
    public headers: Headers;
    private bodyContent: string;

    constructor(body: string | null, options: { status?: number, headers?: Record<string, string>, statusText?: string } = {}) {
        this.status = options.status || 200;
        this.ok = this.status >= 200 && this.status < 300;
        this.headers = new Headers(options.headers || {});
        this.bodyContent = body || '';
    }

    text() {
        return Promise.resolve(this.bodyContent);
    }

    json() {
        try {
            return Promise.resolve(JSON.parse(this.bodyContent));
        } catch (e) {
            return Promise.reject(new Error('Failed to parse JSON'));
        }
    }
}

export function createMockResponse(status: number, data: any, contentType = 'application/json') {
    const body = contentType.includes('json') ? JSON.stringify(data) : data;

    return new MockResponse(body, {
        status,
        headers: {
            'Content-Type': contentType
        }
    }) as unknown as Response;
}

export function setupFetchMock(mockResponses: Record<string, Response>) {
    // @ts-ignore: Overriding fetch for tests
    global.fetch = jest.fn((url: string) => {
        if (url in mockResponses) {
            return Promise.resolve(mockResponses[url]);
        }

        return Promise.resolve(
            new MockResponse(null, { status: 404, statusText: 'Not Found' }) as unknown as Response
        );
    });
}

export function resetFetchMock() {
    // @ts-ignore: Cleaning up fetch mock
    global.fetch.mockClear();
}

declare global {
    namespace NodeJS {
        interface Global {
            fetch: any;
        }
    }
}

// Add a test to prevent Jest from complaining
describe('fetchMock', () => {
    test('createMockResponse should create a valid response object', () => {
        const response = createMockResponse(200, { test: 'data' });
        expect(response.status).toBe(200);
        expect(response.ok).toBe(true);

        // Test text response
        const textResponse = createMockResponse(201, 'Hello world', 'text/plain');
        expect(textResponse.status).toBe(201);
        expect(textResponse.headers.get('Content-Type')).toBe('text/plain');
    });

    test('setupFetchMock should override global fetch', () => {
        const mockResponses = {
            '/test': createMockResponse(200, { success: true })
        };

        setupFetchMock(mockResponses);

        // @ts-ignore: Using mocked fetch
        expect(global.fetch).toBeDefined();
    });
}); 