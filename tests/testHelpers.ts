import fc from 'fast-check';
import type { Position, Layout } from '../src/helpers/types';

export function makeLayout(positon: Position, size: number): Layout {
    return {
        rect: { ...positon, width: size, height: size },
        offsets: {
            paddingTop: 0,
            paddingBottom: 0,
            paddingLeft: 0,
            paddingRight: 0,
        },
    };
}

export function arbitraryPoint(): fc.Arbitrary<Partial<Position>> {
    return fc.record({
        x: fc.float(),
        y: fc.float(),
    });
}
