# Chat Box Component
A React component for integrating real-time video chat functionality into your applications.

### Installation
bash:
`npm install @wanghongl/chat-box`

### Quick Start
app.jsx:
```html
 import { useRef } from 'react';
 import { Content, type ChatBoxImperativeHandle } from '@wanghongl/chat-box';
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
     }
   });
};

return (
  <div className="relative h-screen w-screen bg-white">
    <Content
      openLog={false}
      onStart={onStart}
      onStop={() => {
        // TODO
      }}
      onError={(type, error) => {
        console.debug(type, error);
      }}
    />
  </div>
 )
}

export default App;
```

### props
#### Content Component Props
| Prop             | Type         | Required | Description |
| ---------------- | ------------ | -------- | ----------- |
| openLog          | Boolean      | No       | Enable debug logging |
| onStart          | `(ref: ChatBoxImperativeHandle) => void` | Yes | Callback when chat starts |
| onStop           | `() => void` | No       | Callback when chat stops |
| onError          | `(type: string, error: any) => void` | No | Error handler callback |

### ChatBoxImperativeHandle Methods
`startCall(options: StartCallOptions): Promise<void>`

Starts a video/audio call with the specified configuration.
#### StartCallOptions:
typescript:
```javascript
{
  mode: 'video' | 'audio';
  config: {
    appId: string;
    appKey: string;
    conversationId: string;
    platform: string;
  }
};
```

### Configuration
#### Authentication
- `appId` Your application ID

- `appKey` Your application key

- `conversationId` Unique identifier for the conversation

- `platform` Platform identifier (e.g., 'duix.com')

### Browser Support
This component supports modern browsers with WebRTC capabilities for real-time video/audio communication.

### License
MIT License