import { MicrophoneIcon, VideoCameraIcon, PhoneIcon } from '@heroicons/react/20/solid';
import {
  MicrophoneIcon as MicrophoneIconOutline,
  VideoCameraSlashIcon,
  PhoneIcon as PhoneIconOutline
} from '@heroicons/react/24/outline';
import { Button } from './components/button';
import TextChatClose from './icons/text-chat-close.svg';
import TextChat from './icons/text-chat-active.svg';
import { CurrentStatus, useStore } from './store';
import type { ChatBoxImperativeHandle } from './type';

export default function ActionGroup({
  onStop,
  onStart,
  chatRef
}: {
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
    showTextChat,
  } = useStore(
    'micMuted',
    'cameraVisible',
    'currentStatus',
    'showTextChat',
    'loading',
    'cameraStatus',
    'cameraLoading',
    'showLanguageSelector'
  );

  const isConnected = currentStatus === CurrentStatus.Connected;
  const isConnecting = currentStatus === CurrentStatus.ConnectLoading;

  const disabled = loading;

  const handleStartClick = async () => {
    if (isConnected) {
      onStop();
    } else {
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
              chatRef.switchTextChat();
            }}
          >
            {showTextChat ? (
              <img className={`cb:size-4.5`} src={TextChatClose} alt="icon" />
            ) : (
              <img className={`cb:size-4.5`} src={TextChat} alt="icon" />
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
