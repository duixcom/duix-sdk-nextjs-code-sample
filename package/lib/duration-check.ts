// @ts-nocheck
/**
 * DurationCheck class for managing a one-time timeout with callback execution
 * Useful for implementing session timeouts, operation time limits, etc.
 */
export default class DurationCheck {
    /**
     * @param minutes - Timeout duration in minutes
     * @param reason - Reason or identifier for the timeout
     * @param callback - Callback function executed when timeout completes
     * @param stopCallback - Optional callback executed when timer is stopped manually
     */
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
            this.minutes * 60 * 1000 // Convert minutes to milliseconds
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

/**
 * DurationBalanceCheck class for managing a countdown timer with periodic callbacks
 * Useful for implementing countdown timers, balance updates, etc.
 */
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
