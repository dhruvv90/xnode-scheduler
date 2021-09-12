const { JobStatus } = require('../lib');
const { Job } = require('../index')


describe('Job Tests', () => {

    it('Constructed job should have correct attributes', () => {

        const fn = () => { };
        const j = new Job(fn, { seconds: 1 }, { id: 'id' })
        expect(j.id).toEqual('id');
        expect(j.getStatus()).toEqual(JobStatus.NOT_STARTED);

        j.stop();
        expect(j.getStatus()).toEqual(JobStatus.NOT_STARTED);


    })

    it('should have correct status while running and stopping', () => {
        let counter = 0;
        const fn = () => counter++;
        const j = new Job(fn, { seconds: 1 }, { id: 'id' })

        j.start();
        expect(j.getStatus() === JobStatus.RUNNING);

        j.stop();
        expect(j.getStatus() === JobStatus.STOPPED);
    })

    it('should run Sync function correctly', () => {
        jest.useFakeTimers();
        let counter = 0;
        const fn = () => counter++;
        const j = new Job(fn, { seconds: 1 }, { id: 'id' })

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