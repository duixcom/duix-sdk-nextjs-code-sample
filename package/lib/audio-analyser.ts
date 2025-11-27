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

        // create AudioContext and AnalyserNode
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioAnalyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.audioAnalyser);
        this.audioAnalyser.fftSize = 256;
        this.dataArray = new Uint8Array(this.audioAnalyser.frequencyBinCount);

        // update volume visualization
        this.updateVolume();
    }

    updateVolume = () => {
        if (!this.audioAnalyser || !this.dataArray) return;

        this.audioAnalyser.getByteFrequencyData(this.dataArray);
        const average = this.dataArray.reduce((acc, val) => acc + val, 0) / this.dataArray.length;

        // compute volume percentage with a minimum threshold
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
