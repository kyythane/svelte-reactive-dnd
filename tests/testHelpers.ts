import fc from 'fast-check';
import type {
    Position,
    Layout,
    Placement,
    Direction,
} from '../src/helpers/types';

export function makeLayout(
    positon: Position,
    size: number,
    offset?: number
): Layout {
    return {
        rect: { ...positon, width: size, height: size },
        offsets: {
            paddingTop: offset ?? 0,
            paddingBottom: offset ?? 0,
            paddingLeft: offset ?? 0,
            paddingRight: offset ?? 0,
        },
    };
}

export function arbitraryPoint(): fc.Arbitrary<Partial<Position>> {
    return fc.record({
        x: fc.float(),
        y: fc.float(),
    });
}

export function arbirtraryPlacement(): fc.Arbitrary<Placement> {
    return fc.oneof(
        fc.constant('before' as Placement),
        fc.constant('after' as Placement)
    );
}

export function arbirtraryDirection(): fc.Arbitrary<Direction> {
    return fc.oneof(
        fc.constant('horizontal' as Direction),
        fc.constant('vertical' as Direction)
    );
}
