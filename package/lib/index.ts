import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

type StoreReturn<T, K extends keyof T> = [K] extends [never]
    ? { setState: (state: Partial<T>) => void; getState: () => T }
    : { [P in K]: T[P] } & {
        setState: (state: Partial<T>) => void;
        getState: () => T;
    };
export const useMultiple = <T extends object, K extends keyof T = never>(
    useStoreFn: UseBoundStore<StoreApi<T>>,
    ...items: Array<K>
): StoreReturn<T, K> => {
    return useStoreFn(
        useShallow((state: T) => {
            return items.reduce(
                (acc, item) => ({
                    ...acc,
                    [item]: state[item]
                }),
                { setState: useStoreFn.setState, getState: useStoreFn.getState }
            ) as StoreReturn<T, K>;
        })
    );
};

export type createSliceFunc = <T>(set: (state: Partial<T>) => void, get: () => T) => T;
/**
 * Create a new store
 * @example
 * const createSlice = (set: any, get: any) => ({
 *     count: 0,
 *     increment: () => set({ count: get().count + 1 })
 * });
 * const useStore = createNewStore(createSlice);
 * const { count, increment, setState, getState } = useStore('count', 'increment');
 */
export const createNewStore = <T extends object>(createSlice: (set: any, get: () => any) => T) => {
    const store = create<T>(createSlice);
    const useStoreFunc = <K extends keyof T = never>(...params: Array<K>) => useMultiple(store, ...params);
    useStoreFunc.setState = store.setState;
    useStoreFunc.getState = store.getState;
    return useStoreFunc;
};

export async function hasCamera() {
    try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
            return 0;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.filter((device) => device.kind === 'videoinput')?.length;
    } catch {
        return 0;
    }
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Dynamically load a remote script into the document.
 * @param url The URL of the remote script to load.
 * @param options Optional settings for loading the script.
 * @returns A promise that resolves when the script is loaded or rejects on error.
 */
export function loadRemoteScript(
    url: string,
    options: {
        checkExisting?: boolean;
        onLoad?: () => void;
        onError?: (error: Error) => void;
        attributes?: Record<string, string>;
        targetElement?: HTMLElement;
    } = {}
): Promise<void> {
    const { checkExisting = true, onLoad, onError, attributes = {}, targetElement = document.head } = options;

    if (checkExisting) {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            if (existingScript.getAttribute('data-loaded') === 'true') {
                onLoad?.();
                return Promise.resolve();
            }
            return new Promise((resolve, reject) => {
                const handleLoad = () => {
                    existingScript?.removeEventListener('load', handleLoad);
                    existingScript?.removeEventListener('error', handleError);
                    onLoad?.();
                    resolve();
                };

                const handleError = () => {
                    existingScript?.removeEventListener('load', handleLoad);
                    existingScript?.removeEventListener('error', handleError);
                    const error = new Error(`Failed to load script: ${url}`);
                    onError?.(error);
                    reject(error);
                };

                existingScript.addEventListener('load', handleLoad);
                existingScript.addEventListener('error', handleError);
            });
        }
    }

    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
    });

    return new Promise((resolve, reject) => {
        const handleLoad = () => {
            script.setAttribute('data-loaded', 'true');
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            onLoad?.();
            resolve();
        };

        const handleError = () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            targetElement.removeChild(script);
            const error = new Error(`Failed to load script: ${url}`);
            onError?.(error);
            reject(error);
        };

        // add event listeners
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        targetElement.appendChild(script);
    });
}

// Get document safely
export const getDocument = (): any => {
    if (typeof document !== 'undefined') {
        return document;
    }
    return {};
};

// Countdown utility
export const countdown = (
    remainingSeconds: number = 60,
    callback: (remainingSeconds: number) => void,
    intervalMs: number = 1000
) => {
    const startTime = Date.now();
    const timer = setInterval(() => {
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const currentRemaining = Math.max(remainingSeconds - elapsedSeconds, 0);

        callback(currentRemaining);

        if (currentRemaining <= 0) {
            clearInterval(timer);
        }
    }, intervalMs);

    callback(remainingSeconds);

    return () => clearInterval(timer);
};

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
