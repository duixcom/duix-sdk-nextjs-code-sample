import { useEffect, useRef, useState } from 'react';

const formatTime = (seconds: number) => {
    if (seconds <= 0) return '';

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
        ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export function useTimeDown() {
    const [timeStr, setTimeStr] = useState('');

    const setCountDownTime = (seconds: number) => {
        setTimeStr(seconds > 0 ? formatTime(seconds) : '');
    };

    return {
        timeStr,
        setCountDownTime
    };
}

/**
 * 支持异步函数的副作用Hook
 * 与useEffect类似，但允许effect函数返回Promise
 */
export function useAsyncEffect(effect: () => Promise<void | (() => void)>, deps?: React.DependencyList) {
    // 用于跟踪组件是否已卸载，防止内存泄漏
    const isMounted = useRef(true);
    // 存储清理函数
    const cleanupRef = useRef<(() => void) | void>(null);

    useEffect(() => {
        isMounted.current = true;

        const executeEffect = async () => {
            try {
                // 执行异步effect并获取可能的清理函数
                const cleanup = await effect();
                if (cleanup && isMounted.current) {
                    cleanupRef.current = cleanup;
                }
            } catch (error) {
                console.error('useAsyncEffect error:', error);
            }
        };

        executeEffect();

        // 组件卸载时执行清理
        return () => {
            isMounted.current = false;
            cleanupRef.current?.();
        };
    }, deps);
}
