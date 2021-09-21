/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { JobStatus, IntervalBasedJob, XnodeScheduler } = require('../dist/index');


describe('Error Handling testing', () => {

    let unhandledRej = 0;
    let uncaughtEx = 0;
    let pause = ms => new Promise((res) => setTimeout(res, ms));

    beforeAll(() => {
        process.on('uncaughtException', () => uncaughtEx++);
        process.on('unhandledRejection', () => unhandledRej++);
    })

    beforeEach(() => {
        jest.useFakeTimers();

        unhandledRej = 0;
        uncaughtEx = 0;
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();

        expect(unhandledRej).toBe(0);
        expect(uncaughtEx).toBe(0);
    })

    test('Sync Jobs : Error handler is properly called', () => {

        const fn = jest.fn(() => { throw new Error('error') });
        const errorHandlerFn = jest.fn(() => null);

        const j1 = new IntervalBasedJob('j1', fn, { milliseconds: 100 }, {
            errorHandler: errorHandlerFn
        });

        j1.start();

        jest.advanceTimersByTime(1000);

        expect(fn).toBeCalledTimes(10);
        expect(errorHandlerFn).toBeCalledTimes(10);

        jest.advanceTimersByTime(20);
        j1.stop();
    })

    test('Async Jobs : Error handler is properly called', () => {

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

        j1.stop();

    })

});
