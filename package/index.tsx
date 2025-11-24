'use client';

import { ArrowsPointingInIcon, ChevronDoubleLeftIcon } from '@heroicons/react/20/solid';
import { PhoneIcon as PhoneIconOutline, ClockIcon as ClockIconOutline } from '@heroicons/react/24/outline';
import { debounce, get, isEmpty } from 'lodash-es';
import { nanoid } from 'nanoid';
import { useCallback, useEffect, useMemo, useRef } from 'react';
// @ts-ignore
import DUIX from 'duix-guiji-light';
import ActionGroup from './action-group';
import { Button } from './components/button';
import './index.css';
import { getDocument, hasCamera, sendGAEvent, sleep } from './lib';
import AudioAnalyser from './lib/audio-analyser';
import DurationCheck, { DurationBalanceCheck } from './lib/duration-check';
import { useTimeDown } from './lib/hooks';
import mediaStreamManager from './lib/mediaStreamManager';
import { useStore, CurrentStatus, type Store, ActionType } from './store';
import TextChat from './text-chat';
import { type ChatApp, type ChatBoxImperativeHandle, type StartOptions } from './type';

export { ActionType, CurrentStatus, useStore, type ChatBoxImperativeHandle, type ChatApp };
const log = (...args: any[]) => {
  if (useStore.getState().openLog) {
    console.debug(...args);
  }
};
let STOP_MARKER: any = null;
export function Content({
  InnerElement,
  CoverElement,
  className = '',
  onReady,
  onStart,
  onStop,
  onAction,
  onError,
  openLog = false,
  defaultLanguage,
  languages = [],
  ...rest
}: ChatApp) {
  const { timeStr, setCountDownTime } = useTimeDown();

  const {
    currentStatus,
    isSmallCamera,
    setState,
    getState,
    resetState,
    showChatLetter,
    cameraVisible,
    chatList,
    showTextChat,
    conversationInfo,
    durationBalanceSec
  } = useStore(
    'durationBalanceSec',
    'resetState',
    'showChatLetter',
    'cameraVisible',
    'chatList',
    'showTextChat',
    'isSmallCamera',
    'currentStatus',
    'conversationInfo'
  );

  const duixRef = useRef<any>(null);
  const stopCheckExtIdRef = useRef<string>(null);
  const localAnalyserRef = useRef<AudioAnalyser>(null);
  const remoteAnalyserRef = useRef<AudioAnalyser>(null);
  const checkRef = useRef<{
    activeCheck: DurationCheck;
    stopCallTimeCheck: DurationCheck;
    sessionTimeCheck: DurationCheck;
    durationTimeCheck: DurationCheck;
    tasterTimeCheck: DurationCheck;
    durationBalanceCheck: DurationBalanceCheck;
  }>(null);

  const applyCamera = async (fn: any) => {
    if (getState().cameraLoading) return;
    try {
      setState({
        cameraLoading: true
      });
      let ret;
      if (fn) ret = await fn();

      if (ret) {
        await sleep(1000);
        duixRef.current?.playCamera();
      }
    } finally {
      setState({
        cameraLoading: false
      });
    }
  };

  const startCheckLocalStream = () => {
    const stream = duixRef.current.getLocalStream();
    if (stream) {
      localAnalyserRef.current?.start(duixRef.current.getLocalStream());
      return;
    }
    setTimeout(() => {
      startCheckLocalStream();
    }, 1000);
  };

  const handleSendText = async () => {
    const text = getState().userInputText;
    if (text === '') return;
    setState({
      userInputText: '',
      isInputing: false,
      isWaitingAnswer: true,
      chatList: [...getState().chatList, { type: 'user', content: text }]
    });
    checkRef.current?.activeCheck.stop();
    await chatRef.current?.answer(text, true);
  };

  const chatRef = useRef<ChatBoxImperativeHandle>({
    setState: (state: Partial<Store>) => {
      useStore.setState({ ...state } as any);
    },
    setCallStatus: (status: CurrentStatus) => {
      useStore.setState({ currentStatus: status });
    },
    initDuix: (): Promise<void> => {
      return new Promise((resolve, reject) => {
        duixRef.current = new DUIX();
        registerEvent(duixRef.current);

        duixRef.current.on('intialSucccess', () => {
          setState({
            conversationInfo: duixRef.current?.getConversationInfo()
          });
          resolve();
        });
        const { config } = getState();
        const { appId, appKey, conversationId, userId, platform } = config;
        duixRef.current
          .init({
            containerLable: '.remote-container',
            appId,
            appKey,
            conversationId,
            userId,
            platform,
            useOversea: true
          })
          .catch((err: any) => {
            reject?.({ code: 9999, message: err?.message });
          });
      });
    },
    setDuixOptions: async (optons): Promise<void> => {
      setState(optons);
      const { activeCheckSec, sessionTimeOutSec, tasterSec, stopCallTimeSec, durationBalanceSec } = getState();
      // await loadRemoteScript(sdkUrl);
      const count = await hasCamera();
      setState({
        cameraStatus: count >= 1 ? 1 : 2
      });

      checkRef.current = {
        activeCheck: new DurationCheck(activeCheckSec / 60, ActionType.Inactive, (reason: ActionType) => {
          chatRef.current.stopCall(reason);
        }),
        sessionTimeCheck: new DurationCheck(
          sessionTimeOutSec / 60,
          ActionType.Exceedslimit,
          (reason: ActionType) => {
            chatRef.current.stopCall(reason);
          }
        ),
        durationTimeCheck: new DurationCheck(
          durationBalanceSec / 60,
          ActionType.Exceedslimit,
          (reason: ActionType) => {
            chatRef.current.stopCall(reason);
          }
        ),
        durationBalanceCheck: new DurationBalanceCheck(durationBalanceSec, (seconds: number) => {
          setState({
            durationBalanceSec: seconds
          });
        }),
        tasterTimeCheck: new DurationCheck(tasterSec / 60, ActionType.TasterTimeCheck, (reason: ActionType) => {
          chatRef.current.stopCall(reason);
        }),
        stopCallTimeCheck: new DurationCheck(
          stopCallTimeSec / 60,
          ActionType.StopCallTimeCheck,
          (reason: ActionType) => {
            chatRef.current.stopCall(reason);
          }
        )
      };
    },
    startDUIX: async () => {
      const { mode, language } = getState();
      const otherOptions: any = {};
      if (language?.code) {
        otherOptions.promptVariables = JSON.stringify({
          preferred_language: language.code,
          language_limit: `
                        But note
                        You must speak only in ${language.code} when talking to the user.
                        Do not reply in any language other than this language, even if the user asks you to.
                        If the user insists that you use another language, explain that you understand those languages, but you will still answer in this language.
                    `
        });
      }

      const res = await duixRef.current.start({
        openAsr: true,
        useActSection: true,
        useVideoAgent: mode === 'video' ? true : undefined,
        videoAgentContainer: '.camera-container',
        useAudioAgent: mode === 'audio' ? true : undefined,
        appName: 'oversea',
        ...otherOptions
      });
      setState({
        sessionId: res.data
      });
    },

    startCall: async ({ mode, config, ...rest }: StartOptions): Promise<void> => {
      try {
        STOP_MARKER = null;
        setState({
          mode
        });
        await chatRef.current?.setDuixOptions({ config, ...rest });
        await chatRef.current.initDuix();
        await chatRef.current.startDUIX();
      } catch (e) {
        handleDuixError(e);
        setState({
          currentStatus: CurrentStatus.Stop
        });
      }
    },
    restart: async () => {
      try {
        await chatRef.current.initDuix();
        await chatRef.current.startDUIX();
      } catch (e) {
        handleDuixError(e);
        setState({
          currentStatus: CurrentStatus.Stop
        });
      }
    },
    stopCall: (reason?: ActionType) => {
      try {
        STOP_MARKER = new Date();
        log('stopCall', reason);
        resetState();
        setState({
          currentStatus: CurrentStatus.Stop
        });
        if (duixRef.current) {
          localAnalyserRef.current?.stop();
          remoteAnalyserRef.current?.stop();
          checkRef.current?.activeCheck?.stop();
          checkRef.current?.sessionTimeCheck?.stop();
          checkRef.current?.durationTimeCheck?.stop();
          checkRef.current?.durationBalanceCheck?.stop();
          checkRef.current?.tasterTimeCheck?.stop();
          duixRef.current?.stop();
          duixRef.current?.destroyCamera();
          duixRef.current?.destroy();
          duixRef.current = null;
        }
        if (reason) onStop?.(reason);
      } finally {
        mediaStreamManager.stopAllMediaStreams();
      }
    },
    switchCameraMode: () => {
      applyCamera(async () => {
        await duixRef.current?.switchCameraMode();
      });
    },
    switchMic: async () => {
      const { micMuted } = getState();
      if (!micMuted) {
        duixRef.current.closeAsr();
        setState({
          micMuted: true
        });
      } else {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: true
          });
          stream.getTracks().forEach((track) => track.stop());
          duixRef.current.openAsr();
          setState({
            micMuted: false
          });
        } catch (e) {
          log('switchMic error', e);
        }
      }
    },

    switchCamera: () => {
      const { cameraStatus, cameraVisible } = getState();
      if (cameraStatus === 2) {
        onAction?.(ActionType.CameraStatus, 2);
      }
      if (cameraStatus != 1) return;
      applyCamera(async () => {
        if (cameraVisible) {
          setState({
            isSmallCamera: false
          });
          await duixRef.current?.destroyCamera();
        } else {
          try {
            await duixRef.current?.createCamera();
          } catch (e) {
            await onAction?.(ActionType.CameraPermission, e);
          }
        }
      });
    },
    switchTextChat: () => {
      setState({
        showTextChat: !getState().showTextChat
      });
    },
    switchChatLetter: () => {
      setState({
        showChatLetter: !getState().showChatLetter
      });
    },
    switchVideoMuted: (muted?: boolean) => {
      let flag: boolean = !getState().videoMuted;
      if (typeof muted !== 'undefined') {
        flag = muted;
      }
      setState({
        videoMuted: flag
      });
      duixRef.current?.setVideoMuted(flag);
    },
    answer: async (text: string, interrupt: boolean) => {
      await duixRef.current?.answer({
        question: text,
        interrupt
      });
    },
    switchCameraSize: () => {
      const { isSmallCamera } = getState();
      setState({
        isSmallCamera: !isSmallCamera
      });
    }
  });

  const handleStartClick = async () => {
    useStore.setState({ currentStatus: CurrentStatus.ConnectLoading });
    if (onStart) {
      await onStart?.(chatRef.current);
    } else {
      await chatRef.current.restart();
    }
    sendGAEvent('event', 'chat_call_success', {
      id: getState()?.config?.conversationId
    });
  };

  const handleStopClick = () => {
    chatRef.current.stopCall(ActionType.Stop);
  };

  const handleDuixError = (err: any, type?: string) => {
    log('switchChatLetter', getState().currentStatus);
    if ([CurrentStatus.Stop].includes(getState().currentStatus)) {
      return;
    }
    onError?.(err, type);
  };
  let inputIngTimer: any;

  const handleTextInputing = useCallback(
    debounce(
      () => {
        checkRef.current?.activeCheck.stop();
        if (inputIngTimer) clearTimeout(inputIngTimer);
        inputIngTimer = setTimeout(() => {
          checkRef.current?.activeCheck.start();
        }, 400);
      },
      400,
      {
        leading: true,
        trailing: false
      }
    ),
    []
  );

  const registerEvent = (duix: any) => {
    duix.on('asrStart', () => {
      checkRef.current?.activeCheck.stop();
      setState({
        isInputing: true
      });
    });
    duix.on('asrData', (data: any) => {
      setState({
        chatList: [
          ...getState().chatList,
          {
            type: 'user',
            name: 'user',
            content: data.content
          }
        ]
      });
    });
    duix.on('asrStop', (data: any) => {
      log('asrStop', data);
      setState({
        isWaitingAnswer: true,
        isInputing: false
      });
    });
    duix.on('show', () => {
      log('show');
      if (STOP_MARKER) {
        chatRef.current?.stopCall();
        return;
      }
      chatRef.current.switchVideoMuted(false);
      const { taster, tasterSec, sessionId, durationBalanceSec, sessionTimeOutSec } = getState();
      if (sessionTimeOutSec > 0) {
        checkRef.current?.sessionTimeCheck.start();
      }

      checkRef.current?.activeCheck.start();
      checkRef.current?.durationTimeCheck.start();
      checkRef.current?.durationBalanceCheck.start(durationBalanceSec);

      if (taster && tasterSec) {
        checkRef.current?.tasterTimeCheck.start(tasterSec / 60);
        onAction?.(ActionType.StartSession, sessionId);
      }

      setState({
        currentStatus: CurrentStatus.Connected
      });
      remoteAnalyserRef.current?.start(duix.getRemoteStream());
      startCheckLocalStream();

      // chatRef.current?.switchCamera();

      duix.handleModelCommand({
        type: 'callLLM',
        llmCmdType: 'currentUrl',
        page_url: location.href
      });
    });

    duix.on('speakSection', (data: any) => {
      log('speakSection', data);
      const content = data?.text;
      if (!content) {
        return;
      }
      const extId = data?.ext;
      const id = nanoid(5);
      if (!extId) {
        const { chatList } = getState();
        const AIList = chatList.filter((item) => item.type === 'ai');
        const repeatItem = AIList.find((item) => data?.text.includes(item.content));
        // 没有extId，也没有重复的直接添加
        if (!repeatItem) {
          setState({
            chatList: [
              ...chatList,
              {
                id,
                type: 'ai',
                content: content
              }
            ]
          });
        } else {
          // 有extId，但是重复的，直接更新
          const repeatIndex = chatList.findIndex((item: any) => item?.id === repeatItem?.id);
          chatList.splice(repeatIndex, 1, {
            ...repeatItem,
            content: content
          });
          setState({
            chatList: [...chatList]
          });
        }

        return;
      }
      const { chatList } = getState();
      const hasTemporary = chatList.find((item) => item?.extId === extId);
      if (hasTemporary) {
        const newChatList = chatList.map((item) => {
          if (item?.extId === extId) {
            return {
              ...item,
              content: content
            };
          }
          return item;
        });
        setState({
          chatList: [...newChatList]
        });
      } else {
        setState({
          chatList: [
            ...getState().chatList,
            {
              id,
              type: 'ai',
              extId,
              content: data.text
            }
          ]
        });
      }
    });

    duix.on('speakStart', (data: any) => {
      log('speakStart', data);
      setState({
        isWaitingAnswer: false
      });
      if (stopCheckExtIdRef.current === data?.ext) {
        return;
      }
      checkRef.current?.activeCheck.stop();
    });

    duix.on('speakEnd', (data: any) => {
      log('speakEnd', data);
      const extId = data?.ext;
      const { chatList } = getState();
      const hasTemporary = chatList.find((item) => !!extId && !!item?.extId && item?.extId === extId);
      if (hasTemporary) {
        const newList = chatList.map((item) => {
          if (item?.extId === extId) {
            return {
              type: 'ai',
              content: data.text
            };
          }
          return item;
        });

        setState({
          chatList: [...newList]
        });
      }
      checkRef.current?.activeCheck.start();
    });

    // 播放开始 -- 只有音频模式下才有
    duix.on('ttsSpeakStart', (res: any) => {
      log('ttsSpeakStart', new Date().getTime(), res);
      if (getState().mode === 'audio') {
        setState({
          isWaitingAnswer: true
        });
      }
    });
    // 播放结束 -- 只有音频模式下才有
    duix.on('ttsSpeakEnd', () => {
      log('ttsSpeakEnd', new Date().getTime());
      if (getState().mode === 'audio') {
        setState({
          isWaitingAnswer: false
        });
      }
    });
    duix.on('error', (err: any) => {
      handleDuixError(err, 'duixError');
      checkRef.current?.activeCheck.stop();
    });
    duix.on('bye', () => {
      duix?.removeVideo();
      duix?.destroyCamera();
      chatRef.current.stopCall(ActionType.Bye);
    });
    duix.on('cameraChange', (data: any) => {
      log('cameraChange', data);
      const { cameraVisible } = getState();
      if (!cameraVisible && data.status == 'show') {
        setState({
          cameraVisible: true
        });
      } else {
        setState({
          cameraVisible: false
        });
      }
    });
    getDocument()?.addEventListener('visibilitychange', () => {
      chatRef.current.switchVideoMuted(getDocument()?.visibilityState === 'hidden');
    });
  };

  useEffect(() => {
    log('durationBalanceSec=>', durationBalanceSec);
    if (durationBalanceSec <= 60 * 5) {
      setCountDownTime(durationBalanceSec);
    } else {
      setCountDownTime(0)
    }
  }, [durationBalanceSec]);

  useEffect(() => {
    if (rest?.durationBalanceSec) {
      if (checkRef.current?.durationBalanceCheck.timer) {
        checkRef.current?.durationBalanceCheck.start(rest?.durationBalanceSec);
      }
      setState({
        durationBalanceSec: rest?.durationBalanceSec || 0
      });
    }
  }, [rest?.durationBalanceSec]);

  useEffect(() => {
    mediaStreamManager.enable();
    resetState();
    setState({
      openLog,
      loading: false,
      language: defaultLanguage || languages?.[0] || {}
    });
    onReady?.(chatRef.current);
    return () => chatRef.current.stopCall(ActionType.Unmount);
  }, []);

  const { videoClassName = '', chatLetterStyle = {} }: any = useMemo(() => {
    const videoContainer = getDocument()?.getElementById?.('chat-box-container')!;
    if (isEmpty(conversationInfo) || !videoContainer) return {};
    const boxWidth = videoContainer.clientWidth;
    const boxHeight = videoContainer.clientHeight;
    const boxRatio = boxWidth / boxHeight;
    const videoHeight = get(conversationInfo, 'detailDto.videoHeight', 0);
    const videoWidth = get(conversationInfo, 'detailDto.videoWidth', 0);
    const videoRatio = videoWidth / videoHeight;
    if (videoRatio > boxRatio) {
      return {
        chatLetterStyle: {
          width: '100%'
        },
        videoClassName: 'cb:[&_video]:h-full cb:[&_video]:w-full cb:[&_video]:object-cover!',
        posterClassName: 'cb:[&_video]:object-cover! cb:[&img]:object-cover!'
      };
    } else {
      const videoRealWidth = boxHeight * videoRatio;
      return {
        chatLetterStyle: {
          width: `${videoRealWidth}px`
        },
        videoClassName: 'cb:[&_video]:h-full cb:[&_video]:w-full cb:[&_video]:object-contain!',
        posterClassName: 'cb:[&_video]:object-contain! cb:[&img]:object-contain!'
      };
    }
  }, [conversationInfo]);

  const createLoading = (type: 'loading' | 'calling') => {
    let inner: any;
    if (type === 'loading') {
      inner = <div className="cb:body-s cb:text-light">Loading...</div>;
    } else {
      inner = (
        <>
          <Button
            onClick={() => {
              chatRef.current.stopCall(ActionType.CancelCall);
            }}
            className="cb:size-[60px] cb:bg-white cb:rounded-full cb:flex cb:items-center cb:justify-center"
          >
            <PhoneIconOutline className="cb:size-6 cb:text-dark" />
          </Button>
          <div className="cb:body-s cb:text-light">Calling...</div>
        </>
      );
    }

    return (
      <div className="cb:absolute cb:inset-0 cb:pb-[100px] cb:z-6 cb:bg-black/10 cb:backdrop-blur-2xl cb:flex cb:flex-col cb:gap-4 cb:items-center cb:justify-end">
        {inner}
      </div>
    );
  };

  const CameraContainer = <div className="camera-container cb:h-full cb:w-full" />;

  const VideoContainer = useMemo(() => {
    if (currentStatus === CurrentStatus.Stop) return null;
    return <div className="remote-container cb:h-full cb:w-full" />;
  }, [currentStatus]);

  return (
    <div id="chat-box-container" className={`cb:relative cb:h-full cb:w-full cb:overflow-hidden ${className}`}>
      {currentStatus !== CurrentStatus.Connected && CoverElement}
      <div className={`cb:absolute cb:inset-0 cb:h-full cb:w-full cb:z-2 ${videoClassName}`}>
        {VideoContainer}
      </div>
      <div className="cb:absolute cb:inset-0 cb:z-4 cb:h-full cb:w-full cb:flex cb:flex-col">
        <div className="cb:relative cb:grow">
          <div
            className={`cb:[&_video]:h-full cb:[&_video]:w-full cb:[&_video]:object-cover cb:absolute cb:top-3 cb:right-3 cb:z-1 cb:aspect-[120/213] cb:w-[120px] cb:rounded-[30px] cb:overflow-hidden cb:bg-white/30 cb:md:top-6 cb:md:right-6 cb:md:aspect-[257/164] cb:md:w-[257px] ${cameraVisible ? 'cb:block' : 'cb:hidden'} ${isSmallCamera && 'cb:opacity-0'}`}
          >
            {CameraContainer}
            <Button
              disabled={isSmallCamera}
              className="cb:absolute cb:top-3 cb:right-3 cb:z-30"
              onClick={() => chatRef.current.switchCameraSize()}
            >
              <ArrowsPointingInIcon className="cb:size-4.5 cb:text-white" />
            </Button>
          </div>
          {isSmallCamera && (
            <Button
              className="cb:bg-white cb:rounded-tl-xl cb:rounded-bl-xl cb:absolute cb:md:top-[96.5px] cb:top-[118.5px] cb:right-0 cb:z-30 cb:w-7 cb:h-10 cb:-translate-y-1/2"
              onClick={() => chatRef.current.switchCameraSize()}
            >
              <ChevronDoubleLeftIcon className="cb:size-4.5 cb:text-primary" />
            </Button>
          )}
          <div className="cb:absolute cb:bottom-6 cb:left-0 cb:w-full">
            <div className="cb:w-full cb:flex cb:justify-center">
              {showChatLetter && chatList.length > 0 && (
                <div
                  style={chatLetterStyle}
                  className="cb:w-[90%] cb:md:max-w-[500px] cb:xl:max-w-[700px] cb:body-m cb:md:body-l cb:text-white cb:text-center cb:[text-shadow:#0000008C_1px_0_10px]"
                >
                  {chatList[chatList.length - 1]?.content}
                </div>
              )}
            </div>
          </div>
          {timeStr && currentStatus === CurrentStatus.Connected && (
            <div
              onClick={() => {
                sendGAEvent('event', 'chat_time_left');
                onAction?.(ActionType.Upgrade);
              }}
              className="cb:cursor-pointer cb:rounded-[20px] cb:gap-1.5 cb:absolute cb:top-6 cb:left-6 cb:w-[88px] cb:bg-black/40 cb:flex cb:items-center cb:justify-center cb:text-white cb:body-xs-md cb:h-9"
            >
              <ClockIconOutline className="cb:size-4.5" />
              {timeStr}
            </div>
          )}
          {showTextChat && <TextChat onInputChange={handleTextInputing} onSend={handleSendText} />}
          {InnerElement && <InnerElement useStore={useStore} />}
          {currentStatus === CurrentStatus.ConnectLoading && createLoading('calling')}
        </div>
        <ActionGroup
          languages={languages}
          onStop={handleStopClick}
          onStart={handleStartClick}
          chatRef={chatRef.current}
        />
      </div>
    </div>
  );
}
