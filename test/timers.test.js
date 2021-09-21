/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const { JobStatus, IntervalBasedJob, XnodeScheduler } = require('../dist/index');


describe('Timer Related tests', () => {

    let unhandledRej = 0, uncaughtEx = 0;

    beforeAll(() => {
        process.on('uncaughtException', () => uncaughtEx++);
        process.on('unhandledRejection', () => unhandledRej++);
    })

    beforeEach(() => {
        unhandledRej = 0;
        uncaughtEx = 0;

        jest.useFakeTimers();
    });

    afterEach(() => {
        expect(unhandledRej).toBe(0);
        expect(uncaughtEx).toBe(0)

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    })

    test('Async Job : Timers Test', () => {

        const task = () => {
            return async () => {
                await pause(1000);
                throw new Error('abcd')
            }
        }

        const fn = jest.fn(task());
        const errorHandlerFn = jest.fn(() => null);

        const j1 = new IntervalBasedJob('j1', fn, { milliseconds: 100 }, {
            errorHandler: errorHandlerFn,
            async: true
        });

        j1.start();

        jest.advanceTimersByTime(5000);
        expect(fn).toBeCalledTimes(50);

        j1.stop();

    })
})