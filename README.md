# Duix JavaScript SDK Demo

This sample demonstrates how to use [Duix JavaScript SDK](https://docs.duix.com/api-reference/h5/).

## Quick start

1. Clone the repo:
```bash
git clone https://github.com/duixcom/duix-sdk-react-code-sample.git
```

2. Install dependencies:
```bash
npm install
```

3. Replace `<your appId>`, `<your appKey>`, and `<conversationId>` in [App.jsx](https://github.com/duixcom/duix-sdk-react-code-sample/blob/main/src/App.tsx#L12-L14) with your actual credentials.
```typescript
await chatRef.current?.startCall({
    mode: 'video',
    config: {
        appId: '<your appId>', // Get from Duix Settings -> API Keys
        appKey: '<your appKey>', // Get from Duix Settings -> API Keys
        conversationId: '<conversationId>', // Get from Duix Dashboard
        platform: 'duix.com'
    },
    sessionTimeOutSec: 0
})
```

4. Run locally:
```bash
npm run dev
```

## Requirement
This component supports modern browsers with WebRTC capabilities for real-time video/audio communication.

## Related Links

- Duix: https://www.duix.com
- Duix API & SDK docs: https://docs.duix.com