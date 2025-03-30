export function createMockResponse(status: number, data: any, contentType = 'application/json'): Response {
    const body = contentType === 'application/json'
        ? JSON.stringify(data)
        : (typeof data === 'string' ? data : JSON.stringify(data));

    const response = {
        status,
        ok: status >= 200 && status < 300,
        headers: new Headers({
            'Content-Type': contentType
        }),
        text: jest.fn().mockResolvedValue(body),
        json: jest.fn().mockResolvedValue(data)
    } as unknown as Response;

    return response;
}

export function setupFetchMock(mockResponses: Record<string, Response>): void {
    global.fetch = jest.fn((url: string) => {
        const mockUrl = Object.keys(mockResponses).find(mockUrl =>
            url === mockUrl || url.endsWith(mockUrl)
        );

        if (mockUrl) {
            return Promise.resolve(mockResponses[mockUrl]);
        }

        return Promise.resolve(createMockResponse(404, { error: 'Not Found' }));
    }) as jest.Mock;
}

export function resetFetchMock(): void {
    global.fetch = undefined as any;
}

declare global {
    namespace NodeJS {
        interface Global {
            fetch: any;
        }
    }
} 