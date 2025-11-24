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
 * 创建一个新的 store
 * @param {createSliceFunc} createSlice
 * @returns 新的 store 函数
 * @description 用于创建一个新的 store 函数，该函数可以用于获取 store 中的状态和 setState 方法
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

export const sendGAEvent = (category: string, action: string, value?: object) => {
    if (typeof window !== 'undefined') {
        console.debug('sendGAEvent', category, action, value);
        (window as any)?.gtag?.(category, action, {
            path: location.pathname,
            ...value
        });
    }
};

/**
 * 动态加载远程JavaScript文件
 * @param url 远程JS文件的URL地址
 * @param options 加载选项
 * @returns Promise<void> 加载成功时resolve，失败时reject
 */
export function loadRemoteScript(
    url: string,
    options: {
        /** 是否在加载前检查脚本是否已存在 */
        checkExisting?: boolean;
        /** 脚本加载完成后执行的回调函数 */
        onLoad?: () => void;
        /** 脚本加载失败后执行的回调函数 */
        onError?: (error: Error) => void;
        /** 设置脚本元素的属性 */
        attributes?: Record<string, string>;
        /** 脚本插入的目标元素，默认为document.head */
        targetElement?: HTMLElement;
    } = {}
): Promise<void> {
    const { checkExisting = true, onLoad, onError, attributes = {}, targetElement = document.head } = options;

    // 检查脚本是否已经加载过
    if (checkExisting) {
        const existingScript = document.querySelector(`script[src="${url}"]`);
        if (existingScript) {
            // 如果脚本已存在且已加载完成，则直接resolve
            if (existingScript.getAttribute('data-loaded') === 'true') {
                onLoad?.();
                return Promise.resolve();
            }
            // 如果脚本已存在但尚未加载完成，则返回一个新的Promise等待其加载完成
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

    // 创建新的脚本元素
    const script = document.createElement('script');
    script.src = url;
    script.async = true;

    // 设置额外的属性
    Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
    });

    return new Promise((resolve, reject) => {
        // 处理脚本加载成功
        const handleLoad = () => {
            script.setAttribute('data-loaded', 'true');
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            onLoad?.();
            resolve();
        };

        // 处理脚本加载失败
        const handleError = () => {
            script.removeEventListener('load', handleLoad);
            script.removeEventListener('error', handleError);
            targetElement.removeChild(script); // 清理失败的脚本元素
            const error = new Error(`Failed to load script: ${url}`);
            onError?.(error);
            reject(error);
        };

        // 添加事件监听器
        script.addEventListener('load', handleLoad);
        script.addEventListener('error', handleError);

        // 将脚本添加到DOM
        targetElement.appendChild(script);
    });
}

export const getDocument = (): any => {
    if (typeof document !== 'undefined') {
        return document;
    }
    return {};
};

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
