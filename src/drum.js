import * as c from './constants.js';

/**
 * Mappings of the footwork states for each key
 */
export default [
        // 0 F kick:
        { face: 5, feet: 'lr', layer: '#ad0' },
        // 1 F# 'kick-alt':
        { face: 0, feet: 'lr', layer: '#ad1' },
        // 2 G snare:
        { face: 1, feet: 'r', layer: '#ad2' },
        // 3 G# 'snare-alt':
        { face: 2, feet: 'l', layer: '#ad3' },
        // 4 A rimshot:
        { face: 3, feet: 'r', layer: '#ad4' },
        // 5 A# 'toe-clap':
        { face: 4, feet: 'l', layer: '#ad5' },
        // 6 B tambourine:
        { face: 5, feet: 'r', layer: '#ad6' },

        // 7 C '08':
        { face: 0, feet: 'l', layer: '#ad7' },
        // 8 C# 'closed-hihat':
        { face: 1, feet: 'r', layer: '#ad8' },
        // 9 D '09':
        { face: 2, feet: 'l', layer: '#ad9' },
        // 10 D# 'open-hihat':
        { face: 3, cowbell: false, feet: 'r', layer: '#ad10_1_' },
        // 11 E '10':
        { face: 4, feet: '', layer: '#ad11' },
        //
        ////
        ///
        // 0 F kick:
        { face: 5, feet: 'lr', layer: '#ad0' },
        // 1 F# 'kick-alt':
        { face: 0, feet: 'lr', layer: '#ad1' },
        // 2 G snare:
        { face: 1, feet: 'r', layer: '#ad2' },
        // 3 G# 'snare-alt':
        { face: 2, feet: 'l', layer: '#ad3' },
        // 4 A rimshot:
        { face: 3, feet: 'r', layer: '#ad4' },
        // 5 A# 'toe-clap':
        { face: 4, feet: 'l', layer: '#ad5' },
        // 6 B tambourine:
        { face: 5, feet: 'r', layer: '#ad6' },

        // 7 C '08':
        { face: 0, feet: 'l', layer: '#ad7' },
        // 8 C# 'closed-hihat':
        { face: 1, feet: 'r', layer: '#ad8' },
        // 9 D '09':
        { face: 2, feet: 'l', layer: '#ad9' },
        // 10 D# 'open-hihat':
        { face: 3, cowbell: false, feet: 'r', layer: '#ad10_1_' },
        // 11 E '10':
        { face: 4, feet: '', layer: '#ad11' }
];

export const DRUM_FOOT_LEFT = '#afoot_x5F_left';
export const DRUM_FOOT_RIGHT = '#afoot_x5F_right';
export const COWBELL = '#cowbella';
export const FACE = type => {
        switch (type) {
                case 1:
			return '#face01_1_';
		default:
			return `#face0${type}`;
	}
};
