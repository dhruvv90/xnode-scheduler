/* eslint-disable @typescript-eslint/no-var-requires */
const { JobStatus, JobAsync, JobSync } = require('../index');


describe('JobSync Tests', () => {

    it('Constructed job should have correct attributes', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fn = () => { };
        const j = new JobSync(fn, { seconds: 1 }, 'testJob', undefined, true);

        expect(j.id).toEqual('testJob');
        expect(j.status).toEqual(JobStatus.NOT_STARTED);

    })

    it('should have correct status while running and stopping', () => {
        let counter = 0;
        const fn = () => counter++;
        const j = new JobSync(fn, { seconds: 1 }, 'firstJob', undefined, true);

        j.start();
        expect(j.status === JobStatus.RUNNING);

        j.stop();
        expect(j.status === JobStatus.STOPPED);
    })

    it('should run correctly', () => {
        jest.useFakeTimers();
        let counter = 0;
        const fn = () => counter++;
        const j = new JobSync(fn, { seconds: 1 }, 'testJob', undefined, false);

        j.start();

        jest.advanceTimersByTime(999);
        expect(counter).toEqual(0);

        jest.advanceTimersByTime(1);
        expect(counter).toEqual(1);

        jest.advanceTimersByTime(4000);
        expect(counter).toEqual(5);

        j.stop();

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    })
})

describe('JobAsync Tests', () => {
    it('Constructed job should have correct attributes', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fn = () => { return new Promise(); };
        const j = new JobAsync(fn, { seconds: 1 }, 'testJob', undefined, true);

        expect(j.id).toEqual('testJob');
        expect(j.status).toEqual(JobStatus.NOT_STARTED);
    })

    it('should have correct status while running and stopping', () => {
        let counter = 0;
        const fn = jest.fn(async () => setTimeout(_ => counter++, 5000));
        const j = new JobSync(fn, { seconds: 1 }, 'firstJob', undefined, true);

        expect(j.status === JobStatus.NOT_STARTED);

        j.start();
        expect(j.status === JobStatus.RUNNING);

        j.stop();
        expect(j.status === JobStatus.STOPPED);
    })

    it('should run correctly', () => {
        jest.useFakeTimers();
        let counter = 0;
        const fn = jest.fn(async() => setTimeout(_=>counter++, 1000));
        const j = new JobAsync(fn, { seconds: 1 }, 'testJob', undefined, false);

        expect(j.status === JobStatus.NOT_STARTED);

        j.start();
        expect(fn).toBeCalledTimes(0);
        expect(j.status === JobStatus.RUNNING);

        jest.advanceTimersByTime(1005);
        expect(fn).toBeCalledTimes(1);

        jest.advanceTimersByTime(990);
        expect(counter).toEqual(0);

        jest.advanceTimersByTime(15);
        expect(counter).toEqual(1);

        j.stop();

        expect(j.status === JobStatus.STOPPED);

        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    })
})