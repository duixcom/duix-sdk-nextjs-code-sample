import { useRef } from 'react';
import { Content, type ChatBoxImperativeHandle } from '../package/index';
import './App.css';

function App() {
    const chatRef = useRef<ChatBoxImperativeHandle>(null);
    const onStart = async (ref: ChatBoxImperativeHandle) => {
        chatRef.current = ref;
        await chatRef.current?.startCall({
            mode: 'video',
            config: {
                appId: '<your appId>',
                appKey: '<your appKey>',
                conversationId: '<conversationId>',
                platform: 'duix.com'
            },
            sessionTimeOutSec: 0
        });
    };


    return (
        <div className="relative h-screen w-screen bg-white">
            <Content
                openLog
                onStart={onStart}
                durationBalanceSec={60 * 4}
                onStop={() => {
                    console.debug('stop call');
                }}
                onError={(type, error) => {
                    console.debug(type, error);
                }}
            />
        </div>
    );
}

export default App;
