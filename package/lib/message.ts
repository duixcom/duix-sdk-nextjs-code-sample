export const MESSAGE = {
    expired: {
        code: 'expired',
        title: 'Tips',
        content: 'Your trial time has expired. Log in now to enjoy more benefits!',
        cancelTxt: 'Back To Home',
        confirmTxt: 'Login Now'
    },
    trialLimit: {
        code: 'expired',
        title: 'Tips',
        content: 'Your daily trial limit has been reached. Please log in for more benefits or try again tomorrow!',
        cancelTxt: 'Back To Home',
        confirmTxt: 'Login Now'
    },
    resume: {
        code: 'resume',
        title: 'Tips',
        content: 'The conversation has been ready. Click the Start button to continue.',
        showCancel: false,
        confirmTxt: 'Start Now'
    },
    over: {
        // 通话结束
        code: 'over',
        title: 'Tips',
        content: 'Call ended. Click the Start button to begin a new conversation.',
        cancelTxt: 'Start Now',
        confirmTxt: 'Chat Later'
    },
    copyLink: {
        // 复制链接
        code: 'copyLink',
        title: 'Tips',
        content: 'Please log in via PC to access more features.',
        showCancel: false,
        confirmTxt: 'Copy PC Link'
    },
    error: {
        // 异常
        title: 'Oops, something came up!',
        content: 'Urgent matter - requires my immediate attention. Will resume shortly.'
    },
    busy: {
        code: 'busy',
        title: 'Line Busy',
        content: 'Please hold, your call will be answered shortly.',
        confirmTxt: 'Retry'
    },
    deviceNotFound: {
        code: 'deviceNotFound',
        title: 'No Camera/Microphone Detected',
        content: 'Please check if your camera/microphone is enabled and try again.',
        cancelTxt: 'Got it',
        confirmTxt: 'Retry'
    },
    oneMinuteTimeout: {
        code: 'oneMinuteTimeout',
        title: 'Remember to call me back',
        content: "Hey! You seem busy. Let's chat later~",
        confirmTxt: 'New Chat'
    },
    durationLimit(duration: any) {
        return {
            code: 'durationLimit',
            title: `Oops! Each chat is limited to ${duration} minutes`,
            content: 'Maximum duration exceeded. You may start a new conversation.',
            cancelTxt: 'Later',
            confirmTxt: 'New Chat'
        };
    },
    tokenNotEnough() {
        // if (!checkIsMe()) {
        //     return MESSAGE.shareDurationNotEnough;
        // }
        return {
            code: 'recharge',
            title: 'Oops! Your conversation time has run out.',
            content: 'Your conversation time has expired. Please top up to continue.',
            cancelTxt: 'Maybe Later',
            confirmTxt: 'Top Up'
        };
    },
    shareDurationNotEnough: {
        code: 'login',
        title: 'Shared Account Limit Reached',
        content: `The sharer's conversation limit is used up. Contact them or log in to continue.`,
        cancelTxt: 'Later',
        confirmTxt: 'Log In'
    },
    upgrade() {
        // if (!checkIsMe()) {
        //     return MESSAGE.shareDurationNotEnough;
        // }
        return {
            code: 'upgrade',
            title: 'Oops! Your conversation time has run out.',
            content: 'Your conversation time has expired. Please subscribe to continue.',
            cancelTxt: 'Maybe Later',
            confirmTxt: 'Subscribe'
        };
    }
};
