// @ts-nocheck
export default class AudioAnalyser {
    constructor(el) {
        this.audioContext = null;
        this.audioAnalyser = null;
        this.dataArray = null;
        this.animationFrameId = null;
        this.el = el;
    }

    start(stream) {
        if (!stream) return;
        const elem = this.el;
        if (!elem) {
            return;
        }

        // 创建音频上下文
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.audioAnalyser);
        this.audioAnalyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

        // 开始更新音量
        this.updateVolume();
    }

    updateVolume = () => {
        if (!this.audioAnalyser || !this.dataArray) return;

        this.audioAnalyser.getByteFrequencyData(this.dataArray);
        const average = this.dataArray.reduce((acc, val) => acc + val, 0) / this.dataArray.length;

        // 调整音量计算方法，使用指数函数来放大小音量的差异
        const volumePercentage = Math.min(Math.max(Math.pow(average / 255, 0.5) * 100, 5), 100);

        const volume = getDocument()?.querySelector(this.el);
        if (volume) {
            volume.style.height = `${volumePercentage}%`;
        }
        this.animationFrameId = requestAnimationFrame(this.updateVolume);
    };

    stop() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.audioContext) {
            this.audioContext.close();
        }
        this.audioContext = null;
        this.audioAnalyser = null;
        this.dataArray = null;
    }
}
