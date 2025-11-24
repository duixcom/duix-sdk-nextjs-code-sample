/**
 * 媒体流管理器 - 通过代理模式拦截并管理所有getUserMedia调用
 * 确保在页面卸载时正确释放所有音频/视频轨道
 */

// 存储所有获取的媒体流引用
const mediaStreams: MediaStream[] = [];

// 保存原始的getUserMedia方法引用
let originalGetUserMedia: MediaDevices['getUserMedia'] | null = null;

/**
 * 释放单个媒体流的所有轨道
 * @param stream 要释放的媒体流
 */
export const stopAllTracks = (stream: MediaStream): void => {
    if (!stream) return;

    // 停止并移除所有音频轨道
    stream.getAudioTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
    });

    // 停止并移除所有视频轨道
    stream.getVideoTracks().forEach((track) => {
        track.stop();
        stream.removeTrack(track);
    });
};

/**
 * 释放所有保存的媒体流
 */
export const stopAllMediaStreams = (): void => {
    // 遍历并释放所有媒体流
    while (mediaStreams.length > 0) {
        const stream = mediaStreams.pop();
        if (stream) {
            stopAllTracks(stream);
        }
    }
};

/**
 * 启用媒体流管理器 - 重写getUserMedia方法
 */
export const enableMediaStreamManager = (): void => {
    try {
        if (typeof window === 'undefined') {
            return;
        }

        if (originalGetUserMedia) {
            return;
        }

        // 保存原始方法
        originalGetUserMedia = navigator.mediaDevices.getUserMedia;

        // 重写getUserMedia方法
        navigator.mediaDevices.getUserMedia = async (...args): Promise<MediaStream> => {
            try {
                const stream = await originalGetUserMedia!.apply(navigator.mediaDevices, args);
                mediaStreams.push(stream);
                stream.getTracks().forEach((track) => {
                    track.onended = () => {
                        const index = mediaStreams.indexOf(stream);
                        if (index > -1) {
                            mediaStreams.splice(index, 1);
                        }
                    };
                });

                return stream;
            } catch (error) {
                console.error('获取媒体流失败:', error);
                throw error;
            }
        };

        // 添加页面卸载事件监听器
        const handlePageUnload = () => {
            disableMediaStreamManager();
        };

        window.addEventListener('beforeunload', handlePageUnload);
        window.addEventListener('unload', handlePageUnload);
    } catch (error) {
        console.error('enableMediaStreamManager', error);
    }
};

/**
 * 禁用媒体流管理器 - 还原原始的getUserMedia方法并清理资源
 */
export const disableMediaStreamManager = (): void => {
    // 释放所有媒体流
    stopAllMediaStreams();

    // 还原原始方法
    if (originalGetUserMedia) {
        navigator.mediaDevices.getUserMedia = originalGetUserMedia;
        originalGetUserMedia = null;
    }

    // 移除事件监听器
    window.removeEventListener('beforeunload', disableMediaStreamManager);
    window.removeEventListener('unload', disableMediaStreamManager);
};

// 默认导出
const mediaStreamManager = {
    enable: enableMediaStreamManager,
    disable: disableMediaStreamManager,
    stopAllMediaStreams,
    stopAllTracks
};

export default mediaStreamManager;
