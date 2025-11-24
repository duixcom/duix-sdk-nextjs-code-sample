import { MicrophoneIcon, VideoCameraIcon, PhoneIcon } from '@heroicons/react/20/solid';
import {
  MicrophoneIcon as MicrophoneIconOutline,
  VideoCameraSlashIcon,
  PhoneIcon as PhoneIconOutline
} from '@heroicons/react/24/outline';
import { Button } from './components/button';
import CaptionOutline from './icons/Caption outline.svg';
import Caption from './icons/Caption solid.svg';
import ChatOutline from './icons/Chat outline.svg';
import Chat from './icons/Chat solid.svg';
import { sendGAEvent } from './lib';
import { CurrentStatus, useStore } from './store';
import type { ChatBoxImperativeHandle, Language } from './type';

export default function ActionGroup({
  onStop,
  onStart,
  chatRef
}: {
  language?: Language;
  languages?: Language[];
  onLanguageChange?: (language: Language) => void;
  onStop: () => void;
  onStart: () => void;
  chatRef: ChatBoxImperativeHandle;
}) {
  const {
    cameraLoading,
    loading,
    micMuted,
    cameraVisible,
    currentStatus,
    cameraStatus,
    showChatLetter,
    showTextChat,
  } = useStore(
    'micMuted',
    'cameraVisible',
    'currentStatus',
    'showTextChat',
    'showChatLetter',
    'loading',
    'cameraStatus',
    'cameraLoading',
    'language',
    'showLanguageSelector'
  );

  const isConnected = currentStatus === CurrentStatus.Connected;
  const isConnecting = currentStatus === CurrentStatus.ConnectLoading;

  const disabled = loading;

  const handleStartClick = async () => {
    if (isConnected) {
      sendGAEvent('event', 'chat_call_off');
      onStop();
    } else {
      sendGAEvent('event', 'chat_call_on');
      onStart();
    }
  };

  return (
    <div className="cb:shrink-0 cb:flex cb:w-full cb:items-center cb:justify-center cb:gap-2 cb:bg-dark cb:py-4 cb:backdrop-blur-[70px]">
      {isConnected ? (
        <>
          <Button
            disabled={disabled || !isConnected}
            className="cb:size-8 cb:rounded-full cb:bg-unisex-grey"
            onClick={() => {
              sendGAEvent('event', 'chat_subtitle_toggle');
              chatRef.switchChatLetter();
            }}
          >
            {showChatLetter ? (
              <img className={`cb:size-4.5`} src={Caption} alt="icon" />
            ) : (
              <img className={`cb:size-4.5`} src={CaptionOutline} alt="icon" />
            )}
          </Button>
          <Button
            disabled={disabled || !isConnected}
            className="cb:size-8 cb:rounded-full cb:bg-unisex-grey"
            onClick={() => {
              sendGAEvent('event', 'chat_microphone_toggle');
              chatRef.switchMic();
            }}
          >
            {micMuted ? (
              <MicrophoneIconOutline className="cb:size-4.5 cb:text-white" />
            ) : (
              <MicrophoneIcon className={`cb:size-4.5 cb:text-white`} />
            )}
          </Button>
          <Button
            disabled={disabled || cameraStatus !== 1 || !isConnected}
            loading={cameraLoading}
            isOnlyIcon
            className="cb:size-8 cb:rounded-full cb:bg-unisex-grey cb:text-white"
            onClick={() => {
              sendGAEvent('event', 'chat_camera_toggle');
              chatRef.switchCamera();
            }}
          >
            {cameraVisible ? (
              <VideoCameraIcon className={`cb:size-4.5`} />
            ) : (
              <VideoCameraSlashIcon className={`cb:size-4.5`} />
            )}
          </Button>
          <Button
            disabled={disabled || !isConnected}
            className="cb:size-8 cb:rounded-full cb:bg-unisex-grey"
            onClick={() => {
              sendGAEvent('event', 'chat_text_mode_toggle');
              chatRef.switchTextChat();
            }}
          >
            {showTextChat ? (
              <img className={`cb:size-4.5`} src={Chat} alt="icon" />
            ) : (
              <img className={`cb:size-4.5`} src={ChatOutline} alt="icon" />
            )}
          </Button>
        </>
      ) : null}
      <Button
        disabled={disabled || [CurrentStatus.ConnectLoading].includes(currentStatus)}
        className={`${isConnected || isConnecting ? 'cb:bg-[#e12619] cb:size-8 cb:rounded-full' : 'cb:text-white cb:body-s cb:rounded-5xl cb:h-8 cb:px-5 cb:gap-2 cb:bg-success'}`}
        onClick={handleStartClick}
      >
        {isConnected || isConnecting ? (
          <PhoneIcon className={`cb:size-4.5 cb:rotate-135 cb:text-white`} />
        ) : (
          <>
            <PhoneIconOutline className="cb:size-4.5 cb:text-white" />
            <span>Start video chat</span>
          </>
        )}
      </Button>
    </div>
  );
}
