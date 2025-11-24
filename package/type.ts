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
     * 是否开启体验模式
     */
    taster?: boolean;
    /**
     * 体验模式时间second
     */
    tasterSec?: number;
    /**
     * 会话超时时间second
     */
    sessionTimeOutSec?: number;
    /**
     * 账户时间余额second
     */
    durationBalanceSec?: number;
    /**
     * 活跃检测时间second
     */
    activeCheckSec?: number;
    /**
     * 停止调用时间second
     */
    stopCallTimeSec?: number;
}

export interface InitOptions extends TimeOptions {
    config?: Config;
}

export interface StartOptions extends TimeOptions {
    mode?: 'audio' | 'video' | undefined;
    config: Config;
}

export interface Language {
    /**
     * 语言 名称
     */
    label: string;
    /**
     * 语言 代码
     */
    code: string;
    /**
     * 语言 国旗
     */
    flag?: string;
}

export interface ChatApp {
    className?: string;
    poster?: string;
    defaultLanguage?: Language;
    languages?: Language[];
    openLog?: boolean;
    durationBalanceSec?: number;
    sdkUrl?: string;
    /**
     * 初始化完成回调
     */
    onReady?: (imperativeHandle: ChatBoxImperativeHandle) => void;
    onStop?: (reason?: string) => void;
    onStart?: (imperativeHandle: ChatBoxImperativeHandle) => Promise<void>;
    /**
     * 错误回调
     */
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
    switchChatLetter: () => void;
    switchCameraSize: () => void;
    switchVideoMuted: (muted?: boolean) => void;
    answer: (text: string, interrupt: boolean) => Promise<void>;
    setState: (state: Partial<Store>) => void;
    setCallStatus: (status: CurrentStatus) => void;
}
