declare global {
    interface Window {
        dataLayer: any[];
    }
}

declare function gtag(command: 'config', targetId: string, config?: Record<string, any>): void;
declare function gtag(command: 'event', eventName: string, eventParams?: Record<string, any>): void;
declare function gtag(command: 'js', date: Date): void; 