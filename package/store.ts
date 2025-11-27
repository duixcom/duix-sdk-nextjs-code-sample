import { createNewStore } from './lib';
import type { Config } from './type';

export enum CurrentStatus {
    None = 0,
    ConnectLoading = 1,
    Connected = 2,
    Stop = 3
}

export enum ActionType {
    Bye = 'bye',
    Exceedslimit = 'exceedslimit',
    TasterTimeCheck = 'tasterTimeCheck',
    Inactive = 'inactive',
    Stop = 'stopCall',
    StopMarker = 'stopMarker',
    CancelCall = 'cancelCall',
    Start = 'start',
    Restart = 'restart',
    CameraPermission = 'cameraPermission',
    CameraStatus = 'cameraStatus',
    StartSession = 'startSession',
    Unmount = 'unmount',
    StopCallTimeCheck = 'stopCallTimeCheck',
    Upgrade = 'upgrade'
}

const defaultState = {
    isCalling: false,
    cameraStatus: 0 as 0 | 1 | 2,
    cameraLoading: false,
    mode: '',
    sessionId: '',
    isWaitingAnswer: false,
    cameraVisible: false,
    isSmallCamera: false,
    showTextChat: false,
    micMuted: false, // mic 静音
    videoMuted: true, // 视频
    isInputing: false,
    showLanguageSelector: false,
    userInputText: '',
    chatList: [] as any[]
};

export const useStore = createNewStore((set) => ({
    loading: true,
    openLog: false,
    config: {} as Config,
    conversationInfo: {} as any,
    currentStatus: CurrentStatus.None,
    /**
     * 会话超时时间second
     */
    sessionTimeOutSec: 0,
    /**
     * 账户时间余额second
     */
    durationBalanceSec: 0,
    /**
     * 是否开启体验模式
     */
    taster: false,
    stopCallTimeSec: 15,
    /**
     * 体验模式时间second
     */
    tasterSec: 0,

    activeCheckSec: 60 * 5,
    ...defaultState,
    resetState: () => {
        set(defaultState);
    }
}));

export type Store = typeof useStore;
