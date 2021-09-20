import { Fn, Task, TaskAsync, TaskSync } from './task';

type IntervalOptions = {
    milliseconds?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number,
}

type JobOptions = {

    /** Whether the job should run asynchronously */
    async?: boolean;

    /** 
     * Error handler function when job runs. For Async Job,
     * this will be run as .catch() at the last of function chain. 
     * It is Optional - default value prints error message with Job ID to console
     */
    errorHandler?: Fn<Error>;

    /**
     * If true, Job's first run will be immediately when started.
     */
    runImmediately?: boolean;
}


export enum JobStatus {
    NOT_STARTED = 'NOT_STARTED',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED'
}


export abstract class Job {

    protected readonly task: Task;
    public readonly id: string;
    public status: JobStatus;

    /**
     * 
     * @param id Job ID
     * @param fn [Task] Task definition
     * @param jobOptions [Object] - {async: boolean, runImmediately: boolean, errorHandler: Fn(e:Error)}
     */
    protected constructor(id: string, fn: Fn, jobOptions: JobOptions = {}) {
        if (!id) {
            throw new Error(`'id' must be present`);
        }

        if (!fn) {
            throw new Error(`'fn' must be present`);
        }

        this.id = id;

        jobOptions.async ?
            this.task = new TaskAsync(id, fn, jobOptions.errorHandler) :
            this.task = new TaskSync(id, fn, jobOptions.errorHandler);

        this.status = JobStatus.NOT_STARTED;
    }

    abstract start(): void;

    abstract stop(): void;

}

export class IntervalBasedJob extends Job {

    private timerId: NodeJS.Timer;
    private readonly delay: number;
    private readonly runImmediately: boolean;

    private readonly MAX_DELAY = 2147483647;

    /**
     * 
     * @param id [string] Job ID
     * @param fn [Task] Task definition
     * @param intervalOptions [Object] - {milliseconds, seconds, minutes, hours, days}
     * @param jobOptions [Object] - {async: boolean, runImmediately: boolean, errorHandler: Fn(e:Error)}
     */
    constructor(
        id: string,
        fn: Fn,
        intervalOptions: IntervalOptions,
        jobOptions: JobOptions = {}
    ) {
        super(id, fn, jobOptions);

        if (!intervalOptions || intervalOptions === {}) {
            throw new Error(`'intervalOptions' must be valid`);
        }
        this.delay = this.getMilliseconds(intervalOptions);
        if (this.delay >= this.MAX_DELAY) {
            throw new Error(`[Job ID : ${id}]. Error in creating Job : Time delay greater than or equal to 2147483647 are not supported yet`);
        }
        if (this.delay <= 0) {
            throw new Error(`[Job ID : ${id}]. Error in creating Job : Time delay must be strictly > 0`)
        }

        this.runImmediately = jobOptions.runImmediately ?? false;
    }

    private getMilliseconds(options: IntervalOptions) {
        const {
            milliseconds = 0,
            seconds = 0,
            minutes = 0,
            hours = 0,
            days = 0,
        } = options;

        return milliseconds * 1
            + seconds * 1000
            + minutes * 60 * 1000
            + hours * 60 * 60 * 1000
            + days * 24 * 60 * 60 * 1000;
    }

    /**
  * Start a job or restart a job if already running
  *  */
    start(): void {
        this.timerId ? this.stop() : null;

        if (this.runImmediately) {
            this.task.run();
        }
        this.timerId = setInterval(() => this.task.run(), this.delay);
        this.status = JobStatus.RUNNING;
    }

    stop(): void {
        if (!this.timerId) {
            return;
        }
        clearInterval(this.timerId);
        this.status = JobStatus.STOPPED;
        this.timerId = undefined;
    }
}


