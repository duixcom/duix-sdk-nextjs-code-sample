import type { ComponentType, ReactElement } from 'react';
import type { ActionType, CurrentStatus, Store } from './store';

export interface Config {
    appId: string;
    conversationId: string;
    appKey: string | null;
    userId?: string;
    platform: string;
}

export interface TimeOptions {
    /**
     * Taster mode
     */
    taster?: boolean;
    /**
     * Taster mode seconds
     */
    tasterSec?: number;
    /**
     * session timeout seconds
     */
    sessionTimeOutSec?: number;
    /**
     * duration balance seconds of account
     */
    durationBalanceSec?: number;
    /**
     * check active seconds
     */
    activeCheckSec?: number;
    stopCallTimeSec?: number;
}

export interface InitOptions extends TimeOptions {
    config?: Config;
}

export interface StartOptions extends TimeOptions {
    mode?: 'audio' | 'video' | undefined;
    config: Config;
}

export interface ChatApp {
    className?: string;
    poster?: string;
    openLog?: boolean;
    durationBalanceSec?: number;
    sdkUrl?: string;
    onReady?: (imperativeHandle: ChatBoxImperativeHandle) => void;
    onStop?: (reason?: string) => void;
    onStart?: (imperativeHandle: ChatBoxImperativeHandle) => Promise<void>;
    onError?: (error: any, type?: string) => void;
    onAction?: (type: string, data?: any) => void;
    InnerElement?: ComponentType<{ useStore: Store }>;
    CoverElement?: ReactElement;
}

export interface ChatBoxImperativeHandle {
    startCall: (options: StartOptions) => Promise<any>;
    restart: () => void;
    initDuix: () => Promise<any>;
    setDuixOptions: (initOptions: InitOptions) => void;
    startDUIX: () => Promise<any>;
    stopCall: (reason?: ActionType) => void;
    switchMic: () => void;
    switchCamera: () => void;
    switchCameraMode: () => void;
    switchTextChat: () => void;
    switchCameraSize: () => void;
    switchVideoMuted: (muted?: boolean) => void;
    answer: (text: string, interrupt: boolean) => Promise<void>;
    setState: (state: Partial<Store>) => void;
    setCallStatus: (status: CurrentStatus) => void;
}
