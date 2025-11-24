// @ts-nocheck
export default class DurationCheck {
    constructor(minutes, reason, callback, stopCallback?) {
        this.minutes = minutes;
        this.timer = null;
        this.callback = callback;
        this.stopCallback = stopCallback;
        this.reason = reason;
    }

    start(minutes?: number, reason = '') {
        if (minutes) {
            this.minutes = minutes;
        }
        if (reason) {
            this.reason = reason;
        }
        if (this.timer != null) this.stop();
        this.timer = setTimeout(
            () => {
                this.stop(false);
                /* eslint-disable */
                this.callback && this.callback(this.reason);
            },
            this.minutes * 60 * 1000
        );
    }

    stop(need = true) {
        clearTimeout(this.timer);
        if (need) {
            this.stopCallback && this.stopCallback();
        }
        this.timer = null;
    }
}

export class DurationBalanceCheck {
    timer = null;
    constructor(seconds, callback) {
        this.seconds = seconds;

        this.callback = callback;
    }
    start(seconds?: number) {
        if (this.timer != null) this.stop();
        if (seconds) {
            this.seconds = seconds;
        }
        this.timer = setInterval(() => {
            this.seconds--;
            this.callback && this.callback(this.seconds);
        }, 1000);
    }
    stop() {
        clearInterval(this.timer);
        this.timer = null;
    }
}
