/* eslint-disable @typescript-eslint/no-var-requires */
const { JobStatus, IntervalBasedJob, Scheduler } = require('../lib');


describe('Model Tests', () => {
    describe('JobSync Tests', () => {

        it('Constructed job should have correct attributes', () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const fn = () => { };
            const j = new IntervalBasedJob('testJob', fn, { seconds: 1 });

            expect(j.id).toEqual('testJob');
            expect(j.status).toEqual(JobStatus.NOT_STARTED);

        })

        it('should have correct status while running and stopping', () => {
            let counter = 0;
            const fn = () => counter++;
            const j = new IntervalBasedJob('firstJob', fn, { seconds: 1 });

            j.start();
            expect(j.status === JobStatus.RUNNING);

            j.stop();
            expect(j.status === JobStatus.STOPPED);
        })

        it('should run correctly', () => {
            jest.useFakeTimers();
            let counter = 0;
            const fn = () => counter++;
            const j = new IntervalBasedJob('firstJob', fn, { seconds: 1 });

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

        it('should restart job correctly', () => {
            let counter = 0;
            const fn = () => counter++;
            const j = new IntervalBasedJob('firstJob', fn, { seconds: 1 });

            j.start();
            expect(j.status).toEqual(JobStatus.RUNNING);

            j.stop();
            expect(j.status).toEqual(JobStatus.STOPPED);

            j.start();
            expect(j.status).toEqual(JobStatus.RUNNING);

            j.stop();

        })
    })

    describe('JobAsync Tests', () => {
        it('Constructed job should have correct attributes', () => {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            const fn = () => { return new Promise(); };
            const j = new IntervalBasedJob('testJob', fn, { seconds: 1 }, { async: true });

            expect(j.id).toEqual('testJob');
            expect(j.status).toEqual(JobStatus.NOT_STARTED);
        })

        it('should have correct status while running and stopping', () => {
            jest.useFakeTimers();
            let counter = 0;
            const fn = async () => setTimeout(_ => counter++, 2000);
            const j = new IntervalBasedJob('testJob', fn, { seconds: 1 }, { async: true });

            expect(j.status === JobStatus.NOT_STARTED);

            j.start();
            expect(j.status === JobStatus.RUNNING);

            j.stop();
            expect(j.status === JobStatus.STOPPED);
        })

        it('should run correctly', () => {
            jest.useFakeTimers();
            let counter = 0;
            const fn = jest.fn(async () => setTimeout(_ => counter++, 1000));
            const j = new IntervalBasedJob('testJob', fn, { seconds: 1 }, { async: true });

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

    describe('Scheduler Tests', () => {

        test('Add and Get Jobs', () => {
            const s = new Scheduler();

            let counter = 0;
            const fn = () => counter++;
            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });

            s.addJob(j1);

            const jTest = s.getJob('j1');

            expect(jTest.id).toEqual(j1.id);
            expect(jTest.status === JobStatus.RUNNING);

            expect(() => {
                s.getJob('a');
            }).toThrowError();

            s.stop();
        })

        test('Start and stop Job', () => {
            const s = new Scheduler();

            let counter = 0;
            const fn = () => counter++;

            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });

            s.addJob(j1);

            s.startJob('j1');
            expect(s.getJob('j1').status).toEqual(JobStatus.RUNNING);
            expect(j1.status).toEqual(JobStatus.RUNNING);

            s.stopJob('j1');
            expect(j1.status).toEqual(JobStatus.STOPPED);
            expect(s.getJob('j1').status).toEqual(JobStatus.STOPPED);

            expect(() => {
                s.startJob('a')
            }).toThrowError();

            expect(() => {
                s.stopJob('a')
            }).toThrowError();

            expect(j1.status).toEqual(JobStatus.STOPPED);
            expect(s.getJob('j1').status).toEqual(JobStatus.STOPPED);

            s.stop();
        })

        it('shows error on adding same job again', () => {
            const s = new Scheduler();
            let counter = 0;
            const fn = () => counter++;

            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });

            s.addJob(j1);

            expect(() => {
                s.addJob(j1);
            }).toThrowError();

            s.stop();
        })

        test('Remove Job correctly', () => {
            let counter = 0;
            const fn = () => counter++;

            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });

            const s = new Scheduler();
            s.addJob(j1);


            s.removeJob('non existent');

            const jTest = s.getJob('j1');
            expect(jTest).toBeInstanceOf(IntervalBasedJob);
            expect(jTest.id === 'j1');

            s.removeJob('j1');

            expect(j1.status === JobStatus.STOPPED);

            expect(() => {
                s.getJob('j1')
            }).toThrowError();
        })

        it('correctly shows status summary', () => {
            let counter = 0;
            const fn = () => counter++;
            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });
            const j2 = new IntervalBasedJob('j2', fn, { seconds: 1 });
            const j3 = new IntervalBasedJob('j3', fn, { seconds: 1 });


            const s = new Scheduler();
            s.addJob(j1);
            s.addJob(j2);
            s.addJob(j3);

            expect(s.status()).toMatchObject({
                totalJobs: 3,
                activeJobs: [j1, j2, j3],
                idleJobs: []
            });

            s.stopJob(j1.id);

            expect(s.status()).toMatchObject({
                totalJobs: 3,
                activeJobs: [j2, j3],
                idleJobs: [j1]
            });

            s.stop();
            expect(s.status()).toMatchObject({
                totalJobs: 3,
                activeJobs: [],
                idleJobs: [j1, j2, j3]
            });

            s.removeJob(j1.id);
            expect(s.status()).toMatchObject({
                totalJobs: 2,
                activeJobs: [],
                idleJobs: [j2, j3]
            });

        })

        it('stops all jobs correctly', () => {
            let counter = 0;
            const fn = () => counter++;
            const j1 = new IntervalBasedJob('j1', fn, { seconds: 1 });
            const j2 = new IntervalBasedJob('j2', fn, { seconds: 1 });
            const j3 = new IntervalBasedJob('j3', fn, { seconds: 1 });

            const s = new Scheduler();
            s.addJob(j1);
            s.addJob(j2);
            s.addJob(j3);

            [j1, j2, j3].forEach((job) => {
                expect(job.status).toEqual(JobStatus.RUNNING);
            })

            s.stop();

            [j1, j2, j3].forEach((job) => {
                expect(job.status).toEqual(JobStatus.STOPPED);
            })

            expect(s.status()).toMatchObject({
                totalJobs: 3,
                activeJobs: [],
                idleJobs: [j1, j2, j3]
            });
        })
    })

})

