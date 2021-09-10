import { AsyncTask, SyncTask, Task } from "./task";
import { v4 } from 'uuid';
import { AsyncFn, SyncFn } from "../utils";

const MAX_DELAY = 2147483647;

export enum JobStatus {
    NOT_STARTED = 'NOT_STARTED',
    RUNNING = 'RUNNING',
    STOPPED = 'STOPPED'
};

export type SchedulerOptions = {
    milliseconds?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number,
}

export const getMilliseconds = (options: SchedulerOptions): number => {
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

type JobOptions = {
    runAtStart?: boolean,
    isAsync?: true,
    errorHandler?: (e: Error) => void,
    id?: string;
}

export class Job {

    public readonly id: string;

    private timerId: NodeJS.Timer;
    private readonly timerDuration: number;

    private status: JobStatus;
    private readonly task: Task;
    private readonly runAtStart: boolean;

    constructor(fn: SyncFn | AsyncFn, schedulerOptions: SchedulerOptions, jobOptions: JobOptions = {}) {
        let {
            errorHandler,
            isAsync = false,
            runAtStart = true,
            id
        } = jobOptions;

        if (!id) {
            id = v4();
        }

        isAsync
            ? this.task = new AsyncTask(id, fn as AsyncFn, errorHandler)
            : this.task = new SyncTask(id, fn as SyncFn, errorHandler);

        this.id = id;
        this.runAtStart = runAtStart;

        this.timerDuration = getMilliseconds(schedulerOptions);
        if(this.timerDuration >= MAX_DELAY ){
            throw new Error(`Error in creating Job : "${this.id}". Time delays greater than or equal to 2147483647 are not supported yet`);
        }

        this.status = JobStatus.NOT_STARTED;
    }

    /**
     * Start a job or restart a job if already running
     *  */
    start(): void {
        // already running
        this.timerId ? this.stop() : null;

        if (this.runAtStart) {
            this.task.handle();
        }
        this.timerId = setInterval(() => this.task.handle(), this.timerDuration);
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

    getStatus(): JobStatus {
        return this.status;
    }

}
