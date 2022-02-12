class AnimatedObject {
    children = [];

    constructor(x, y, elementId, relativeTo = null) {
        this.coords = {
            x: 0,
            y: 0
        }
        this.doom = document.getElementById(elementId);
        this.relativeTo = relativeTo;
        if (relativeTo != null) {
            relativeTo.children.push(this);
        }

        Object.defineProperty(this, 'y', {
            set: (y) => {
                this.coords.y = y;
                if (this.relativeTo != null)
                    y += relativeTo.y;

                this.doom.style.top = `${y}px`;

                this.children.forEach(child => child.y = child.y);
            },
            get: () => { return this.coords.y; }
        });
        Object.defineProperty(this, 'x', {
            set: (x) => {
                this.coords.x = x;
                if (this.relativeTo != null)
                    x += relativeTo.x;
                this.doom.style.left = `${x}px`;

                this.children.forEach(child => child.x = child.x);
            },
            get: () => { return this.coords.x; }
        });

        this.x = x;
        this.y = y;
    }

    get width() { return this.doom.width; }
    get height() { return this.doom.height; }
}

const head = {
    big: null,
    small: null,
    initiate: () => {
        head.big = new AnimatedObject(0, 0, 'head');
        head.small = new AnimatedObject(52, 499, 'mouth', head.big);
    },
    width: () => { return head.big.width + head.small.width },
    height: () => { return head.big.height + head.small.height }
}

const centerHead = () => {
    head.big.x = window.innerWidth / 2 - head.big.width / 2;
    head.big.y = window.innerHeight / 2 - head.height() / 2;
}

const microphoneInputTest = () => {
    navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true
    })
        .then(function (stream) {
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;

            microphone.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
            scriptProcessor.onaudioprocess = function () {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                const arraySum = array.reduce((a, value) => a + value, 0);
                const average = arraySum / array.length;

                head.small.y = 499 + average;
            };
        })
        .catch(function (err) {
            console.error(err);
        });
}

window.onload = () => {
    head.initiate();
    centerHead();
    window.onresize = () => centerHead();

    microphoneInputTest();
}