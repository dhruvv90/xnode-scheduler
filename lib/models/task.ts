import { AsyncFn, SyncFn } from "./job";

const defaultErrorHandler = function (name: string) {
    return (e: Error): void => {
        console.log(`Error in running task with name : ${name} with error - ${e.message}`);
    }
}

export abstract class Task {
    private readonly id: string;
    protected readonly errorHandler: (err: Error) => void;

    protected constructor(id: string, errorHandler?: (err: Error) => void) {
        this.id = id;
        this.errorHandler = errorHandler || defaultErrorHandler(this.id);
    }

    abstract handle(): void;
}

export class SyncTask extends Task {
    private readonly handler: () => void;

    constructor(id: string, handler: SyncFn, errorHandler?: (e: Error) => void) {
        super(id, errorHandler);
        this.handler = handler;
    }

    handle(): void {
        try {
            this.handler();
        }
        catch (e) {
            this.errorHandler(e);
        }
    }
}


export class AsyncTask extends Task {
    private readonly handler: () => Promise<void>;

    constructor(id: string, handler: AsyncFn, errorHandler?: (e: Error) => void) {
        super(id, errorHandler);
        this.handler = handler;
    }

    handle(): void {
        this.handler().catch(this.errorHandler);
    }
}