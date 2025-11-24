import { XMarkIcon, LockClosedIcon, PaperAirplaneIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/solid';
import { trim } from 'lodash-es';
import { useEffect, useMemo, useRef } from 'react';
import { Button } from './components/button';
import { useStore } from './store';

const MAX_INPUT_LENGTH = 100;
export default function TextChat({
    onInputChange,
    onSend
}: {
    onInputChange?: () => void;
    onSend: (text: string) => void;
}) {
    const {
        cameraVisible,
        isSmallCamera,
        conversationInfo,
        getState,
        isWaitingAnswer,
        isInputing,
        userInputText,
        showTextChat,
        chatList,
        setState
    } = useStore(
        'cameraVisible',
        'isSmallCamera',
        'showTextChat',
        'chatList',
        'cameraVisible',
        'isInputing',
        'userInputText',
        'isWaitingAnswer',
        'conversationInfo'
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const chatListRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        chatListRef.current?.scrollTo({
            behavior: 'smooth',
            top: chatListRef.current?.scrollHeight || 0
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onInputChange?.();
        if (trim(e.target.value) === '') {
            setState({ isInputing: false, userInputText: '' });
            return;
        }
        setState({ isInputing: true });
        setTimeout(() => {
            scrollToBottom();
        }, 100);
        const text = e.target.value.substring(0, MAX_INPUT_LENGTH);
        setState({ userInputText: text });
    };

    const handleSend = async () => {
        const text = getState().userInputText;
        if (text === '') return;
        await onSend(text);
    };

    useEffect(() => {
        setTimeout(() => {
            scrollToBottom();
        }, 200);
    }, [chatList]);

    useEffect(() => {
        inputRef.current?.focus();
        scrollToBottom();
    }, []);

    const heightClass = useMemo(() => {
        const showFullHeight = !cameraVisible || isSmallCamera;
        if (showFullHeight) return 'cb:max-h-[calc(100%_-_12px)] cb:md:max-h-[calc(100%_-_24px)]';
        return 'cb:max-h-[calc(100%_-_265px)] cb:md:max-h-[calc(100%_-_233px)]';
    }, [cameraVisible, isSmallCamera]);

    return (
        <div
            className={`cb:flex cb:flex-col cb:absolute cb:z-5 cb:shadow-sm cb:bg-light cb:bottom-6 cb:w-[257px] cb:right-3 cb:md:right-6 cb:rounded-[30px] cb:h-[419px] cb:md:h-[512px] cb:overflow-hidden ${heightClass}`}
        >
            <div className="cb:shrink-0 cb:md:[box-shadow:_0px_1px_4px_0px_#00000026] cb:h-[44px] cb:md:h-[52px] cb:flex cb:justify-between cb:items-center cb:px-4 cb:py-2">
                <div className="cb:flex-1 cb:body-s cb:text-dark"></div>
                <div className="cb:flex-1 cb:body-s cb:text-dark cb:text-center">Chat</div>
                <Button
                    onClick={() => setState({ showTextChat: !showTextChat })}
                    className="cb:flex-1 cb:flex cb:items-center cb:justify-end"
                >
                    <XMarkIcon className="cb:size-6 cb:text-dark" />
                </Button>
            </div>
            <div
                ref={chatListRef}
                className="cb:flex-grow cb:scrollbar-hidden cb:overflow-y-auto cb:pt-5 cb:pb-6 cb:px-3 cb:flex cb:gap-4 cb:flex-col"
            >
                {chatList.map((item, index) => {
                    if (item.type === 'ai')
                        return (
                            <div
                                key={index}
                                className="cb:max-w-[221px] cb:w-fit cb:text-left cb:bg-light-grey cb:rounded-[8px] cb:px-4 cb:py-2"
                            >
                                <div className="cb:caption cb:text-secondary-text">
                                    {conversationInfo?.conversationName}
                                </div>
                                <div className="cb:body-xs cb:text-dark">{item.content}</div>
                            </div>
                        );
                    return (
                        <div key={index} className="cb:flex cb:justify-end">
                            <div className="cb:max-w-[221px] cb:w-fit cb:text-right cb:bg-grey-md cb:rounded-[8px] cb:px-4 cb:py-2">
                                <div className="cb:body-xs cb:text-dark">{item.content}</div>
                            </div>
                        </div>
                    );
                })}
                {isInputing && (
                    <div className="cb:flex cb:justify-end">
                        <div className="cb:max-w-[221px] cb:w-fit cb:bg-grey-md cb:rounded-[8px] cb:px-4 cb:py-2">
                            <EllipsisHorizontalIcon className="cb:size-5 cb:text-dark" />
                        </div>
                    </div>
                )}
                {isWaitingAnswer && (
                    <div className="cb:max-w-[221px] cb:w-fit cb:text-left cb:bg-light-grey cb:rounded-[8px] cb:px-4 cb:py-2">
                        <EllipsisHorizontalIcon className="cb:size-5 cb:text-dark" />
                    </div>
                )}
            </div>
            <div className="cb:pb-3 cb:px-3 cb:pt-4 cb:w-full">
                <div className="cb:w-full cb:rounded-[20px] cb:px-3 cb:relative cb:flex cb:items-center cb:flex-row cb:h-[44px] cb:border cb:border-grey-md cb:gap-2">
                    <div className="cb:shrink-0">
                        <LockClosedIcon className="cb:shrink-0 cb:size-5 cb:text-grey-md" />
                    </div>
                    <input
                        ref={inputRef}
                        value={userInputText}
                        maxLength={MAX_INPUT_LENGTH}
                        onKeyUp={(e: any) => {
                            if (e.keyCode === 13) handleSend();
                        }}
                        onChange={handleInputChange}
                        className="cb:w-full cb:flex-grow cb:outline-none cb:selection:bg-transparent cb:h-full cb:body-s"
                    />
                    <Button
                        disabled={!userInputText}
                        onClick={handleSend}
                        className="cb:shrink-0 cb:text-dark cb:hover:text-secondary-text"
                    >
                        <PaperAirplaneIcon className="cb:shrink-0 cb:size-5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
