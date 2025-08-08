const [$midi] = [Symbol('midi')];

/**
 * Map MIDI notes to pattern indexes
 * @type {Object}
 */
export const whiteKeys = {
    53: 0,
    55: 1,
    57: 2,
    59: 3,
    60: 4,
    62: 5,
    64: 6,
    65: 7,
    67: 8,
    69: 9,
    71: 10,
    72: 11,
    74: 12,
    76: 13
};

/**
 * MIDI mapping of the OP-1 keyboard range
 * @param  {int} midiNote
 */
export const midiToIdx = midiNote => (midiNote ? midiNote - 53 : null);
/**
 * Index mapping of the OP-1 keyboard range
 * @param  {int} midiNote
 */
export const idxToMidi = idx => idx + 53;

/**
 * Handle the Web MIDI API
 */
export default class MIDI {
    constructor() {
        if (navigator.requestMIDIAccess) {
            navigator
                .requestMIDIAccess()
                .then(this.success.bind(this), this.failure.bind(this));
        } else {
            alert(
                "Web MIDI API not supported, I haven't coded computer keyboard controls yet..."
            );
        }
    }
    success(midi) {
        this[$midi] = midi;

        for (var input of midi.inputs.values()) {
            console.log(
                `MIDI IN device connected: ${input.manufacturer} - ${input.name}`
            );
            // Listen to input from every MIDI device
            input.onmidimessage = this.message.bind(this);
        }

        for (var output of midi.outputs.values()) {
            console.log(
                `MIDI OUT device connected: ${output.manufacturer} - ${output.name}`
            );
        }
    }
    failure() {
        console.log('Could not access your MIDI devices.');
    }
    /**
     * Lots of help from https://github.com/notthetup/midimessage/blob/gh-pages/src/index.js
     */
    message(event) {
        const channel = (event.data[0] & 0x0f) + 1;
        const command = event.data[0] & 0xf0;

        const note = event.data[1] & 0x7f;
        const velocity = event.data[2] & 0x7f;

        switch (command) {
            // note on
            case 0x90:
                if (velocity !== 0 && whiteKeys[note] !== undefined) {
                    this.noteon(channel, note);
                } else if (!velocity) {
                    this.noteoff(channel, note);
                }
                break;
            // note off
            case 0x80:
                this.noteoff(channel, note);
                break;
        }
    }
    send(channel, command, note = 0, velocity = 0) {
        switch (command) {
            case 'noteoff':
                command = 0x80;
                break;
            case 'noteon':
                command = 0x90;
                break;
        }
        for (var output of this[$midi].outputs.values()) {
            // Send to every MIDI device on the appropriate channel
            // noteTimestamp is set in the main beat loop, so the MIDI notes will be played on time
            output.send(
                [command + (channel - 1), note, velocity],
                this.noteTimestamp
            );
        }
    }
    /**
     * Called when receiving a noteon message
     */
    noteon(channel, note) {
        // To be overridden by user
    }
    /**
     * Called when receiving a noteoff message
     */
    noteoff(channel, note) {
        // To be overridden by user
    }
}