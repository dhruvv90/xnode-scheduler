import { Task } from "./task";
import { uuid } from 'uuidv4';

export enum JobStatus {
    NOT_STARTED,
    RUNNING,
    STOPPED
};

type SchedulerOptions = {
    milliseconds?: number,
    seconds?: number,
    minutes?: number,
    hours?: number,
    days?: number,
    runAtStart?: boolean
}

const getMilliseconds = (options: SchedulerOptions): number => {
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
        + days * 24 * 60 * 60 * 1000
}

export class Job {

    public readonly id: string;
    private timerId: NodeJS.Timer;
    private status: JobStatus;
    private readonly task: Task;
    private readonly schedulerOptions: SchedulerOptions;

    constructor(task: Task, schedulerOptions: SchedulerOptions) {
        this.task = task;
        this.id = uuid();
        this.schedulerOptions = schedulerOptions;
        this.status = JobStatus.NOT_STARTED;
    }

    /**
     * Start a job or restart a job if already running
     *  */
    start(): void {
        // already running
        this.timerId ? this.stop() : null;

        if (this.schedulerOptions.runAtStart) {
            this.task.handle();
        }
        this.timerId = setInterval(this.task.handle, getMilliseconds(this.schedulerOptions));
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
