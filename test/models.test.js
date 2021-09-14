/* eslint-disable @typescript-eslint/no-var-requires */
const { JobStatus, JobAsync, JobSync } = require('../index');


describe('Job Tests', () => {

    it('Constructed job should have correct attributes', () => {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const fn = () => { };
        const j = new JobSync(fn, {seconds: 1}, 'testJob', undefined, true);

        expect(j.id).toEqual('testJob');
        expect(j.status).toEqual(JobStatus.NOT_STARTED);
    })

    it('should have correct status while running and stopping', () => {
        let counter = 0;
        const fn = () => counter++;
        const j = new JobSync(fn, {seconds: 1}, 'firstJob', undefined, true);

        j.start();
        expect(j.status === JobStatus.RUNNING);

        j.stop();
        expect(j.status === JobStatus.STOPPED);
    })

    it('should run Sync function correctly', () => {
        jest.useFakeTimers();
        let counter = 0;
        const fn = () => counter++;
        const j = new JobSync(fn, {seconds: 1}, 'testJob', undefined, false);

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