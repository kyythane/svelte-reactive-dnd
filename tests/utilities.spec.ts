import fc from 'fast-check';

import { arbitraryPoint, makeLayout } from './testHelpers';
import type { Position } from '../src/helpers/types';
import { moveRectTo, translateLayoutsBy } from '../src/helpers/utilities';

describe('Basic utility tests', () => {
    describe('moveRectTo', () => {
        it('moves the rectangle to the specified position', () => {
            fc.assert(
                fc.property(arbitraryPoint(), (position) => {
                    const input = { x: 10, y: 30, width: 100, height: 200 };
                    const output = moveRectTo(input, position as Position);
                    expect(output).toEqual({
                        x: position.x,
                        y: position.y,
                        width: input.width,
                        height: input.height,
                    });
                })
            );
        });
    });

    describe('translateLayoutsBy', () => {
        it('moves the layouts by the amount specified, without updating offests or size', () => {
            const length = 10;
            const layouts = new Array(length)
                .fill(undefined)
                .map((_, index) => makeLayout({ x: 0, y: 50 * index }, 25));
            fc.assert(
                fc.property(
                    fc.tuple(fc.integer(0, length - 1), arbitraryPoint()),
                    ([startIndex, offset]) => {
                        const translated = translateLayoutsBy(
                            [...layouts],
                            startIndex,
                            offset as Position
                        );
                        expect(translated.length).toBe(layouts.length);
                        translated.forEach((translatedLayout, index) => {
                            const originalLayout = layouts[index];
                            if (index < startIndex) {
                                expect(translatedLayout).toEqual(
                                    originalLayout
                                );
                            } else {
                                expect(translatedLayout).toEqual({
                                    rect: {
                                        x: offset.x + originalLayout.rect.x,
                                        y: offset.y + originalLayout.rect.y,
                                        width: originalLayout.rect.width,
                                        height: originalLayout.rect.height,
                                    },
                                    offsets: originalLayout.offsets,
                                });
                            }
                        });
                    }
                )
            );
        });
    });
});
