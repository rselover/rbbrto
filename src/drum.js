import * as c from './constants.js';

/**
 * Mappings of the right foot's toe states for each key
 */
export default [
        // 0 F kick:
        { face: 5, toes: 'lr', layer: '#ad0' },
        // 1 F# 'kick-alt':
        { face: 0, toes: 'lr', layer: '#ad1' },
        // 2 G snare:
        { face: 1, toes: 'r', layer: '#ad2' },
        // 3 G# 'snare-alt':
        { face: 2, toes: 'l', layer: '#ad3' },
        // 4 A rimshot:
        { face: 3, toes: 'r', layer: '#ad4' },
        // 5 A# 'toe-clap':
        { face: 4, toes: 'l', layer: '#ad5' },
        // 6 B tambourine:
        { face: 5, toes: 'r', layer: '#ad6' },

        // 7 C '08':
        { face: 0, toes: 'l', layer: '#ad7' },
        // 8 C# 'closed-hihat':
        { face: 1, toes: 'r', layer: '#ad8' },
        // 9 D '09':
        { face: 2, toes: 'l', layer: '#ad9' },
        // 10 D# 'open-hihat':
        { face: 3, cowbell: false, toes: 'r', layer: '#ad10_1_' },
        // 11 E '10':
        { face: 4, toes: '', layer: '#ad11' },
        //
        ////
        ///
        // 0 F kick:
        { face: 5, toes: 'lr', layer: '#ad0' },
        // 1 F# 'kick-alt':
        { face: 0, toes: 'lr', layer: '#ad1' },
        // 2 G snare:
        { face: 1, toes: 'r', layer: '#ad2' },
        // 3 G# 'snare-alt':
        { face: 2, toes: 'l', layer: '#ad3' },
        // 4 A rimshot:
        { face: 3, toes: 'r', layer: '#ad4' },
        // 5 A# 'toe-clap':
        { face: 4, toes: 'l', layer: '#ad5' },
        // 6 B tambourine:
        { face: 5, toes: 'r', layer: '#ad6' },

        // 7 C '08':
        { face: 0, toes: 'l', layer: '#ad7' },
        // 8 C# 'closed-hihat':
        { face: 1, toes: 'r', layer: '#ad8' },
        // 9 D '09':
        { face: 2, toes: 'l', layer: '#ad9' },
        // 10 D# 'open-hihat':
        { face: 3, cowbell: false, toes: 'r', layer: '#ad10_1_' },
        // 11 E '10':
        { face: 4, toes: '', layer: '#ad11' }
];

export const DRUM_TOE_LEFT = '#ahand_x5F_left';
export const DRUM_TOE_RIGHT = '#ahand_x5F_right';
export const COWBELL = '#cowbella';
export const FACE = type => {
	switch (type) {
		case 1:
			return '#face01_1_';
		default:
			return `#face0${type}`;
	}
};
