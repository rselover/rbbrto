/**
 * DOM selectors for the big foot's left-foot keyboard controller
 */
export const SYNTH_LEFT = [
        '#synth > polygon:nth-child(1)',
        '#synth > polyline:nth-child(28)',
        '#synth > line:nth-child(77)'
];
export const SYNTH_BITS_LEFT = '#synth > :nth-child(n+29):nth-child(-n+47)';

export const KEY_GUIDE = '#bkguide';
export const SYNTH_IDLE_TOE_LEFT = '#hblu';
export const SYNTH_IDLE_TOE_RIGHT = '#hbru';
export const SYNTH_PLAY_TOE_LEFT = '#hbld';
export const SYNTH_PLAY_TOE_RIGHT = '#hbrd';
