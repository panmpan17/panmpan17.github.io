let audioPool = new Map();
const MAX_INSTANCES_PER_SOUND = 15;

function playAudioFromPool(soundUrl, volume) {
    if (!audioPool.has(soundUrl)) {
        audioPool.set(soundUrl, []);
    }
    const soundInstances = audioPool.get(soundUrl);
    let htmlAudio = null;

    for (let i = 0; i < soundInstances.length; i++) {
        if (soundInstances[i].paused || soundInstances[i].ended) {
            htmlAudio = soundInstances[i];
            break;
        }
    }

    if (htmlAudio) {
        htmlAudio.volume = volume;
        htmlAudio.currentTime = 0;
        htmlAudio.play().catch(error => {
            console.error('Playback failed (e.g., user gesture required or other error):', error);
        });
    }
    else {
        if (soundInstances.length >= MAX_INSTANCES_PER_SOUND) {
            console.warn('Max instances reached for sound:', soundUrl, '. Cannot play new instance.');
            return;
        }

        htmlAudio = new Audio();
        htmlAudio.src = soundUrl; // Set source once
        soundInstances.push(htmlAudio); // Add to pool

        htmlAudio.onerror = function () {
            console.error('Error loading or playing sound:', soundUrl, htmlAudio.error);
        };

        htmlAudio.volume = volume;
        htmlAudio.currentTime = 0; // Reset to start for reuse
        htmlAudio.play().catch(error => {
            console.error('Playback failed (e.g., user gesture required or other error):', error);
        });
    }
};

function preloadAudioIntoPool(soundUrl, count) {
    if (!audioPool.has(soundUrl)) {
        audioPool.set(soundUrl, []);
    }
    const soundInstances = audioPool.get(soundUrl);

    count = count || 1;
    for (let i = soundInstances.length; i < count; i++) {
        const htmlAudio = new Audio();
        htmlAudio.src = soundUrl;
        soundInstances.push(htmlAudio);
    }
}
