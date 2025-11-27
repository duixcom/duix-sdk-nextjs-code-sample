import { useEffect, useRef, useState } from 'react';

// Helper function to format seconds into HH:MM:SS or MM:SS
const formatTime = (seconds: number) => {
    if (seconds <= 0) return '';

    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    return hours > 0
        ? `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
        : `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Hook for managing countdown timer state
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

// Hook for handling asynchronous effects in React components
export function useAsyncEffect(effect: () => Promise<void | (() => void)>, deps?: React.DependencyList) {
    const isMounted = useRef(true);
    const cleanupRef = useRef<(() => void) | void>(null);

    useEffect(() => {
        isMounted.current = true;

        const executeEffect = async () => {
            try {
                const cleanup = await effect();
                if (cleanup && isMounted.current) {
                    cleanupRef.current = cleanup;
                }
            } catch (error) {
                console.error('useAsyncEffect error:', error);
            }
        };

        executeEffect();

        return () => {
            isMounted.current = false;
            cleanupRef.current?.();
        };
    }, deps);
}
