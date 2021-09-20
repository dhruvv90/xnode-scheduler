/* eslint-disable @typescript-eslint/no-explicit-any */
import * as assert from 'assert';

type FnSync<x = any> = (p?: x) => void;
type FnAsync<x = any> = (p?: x) => Promise<void>;
export type Fn<x = any> = FnSync<x> | FnAsync<x>;


export abstract class Task {

    private readonly id: string;
    protected readonly fn: Fn;
    protected readonly errorHandler: Fn<Error>;

    constructor(id: string, fn: Fn, errorHandler?: Fn<Error>) {
        assert(id, 'id must be present');
        assert(fn, 'fn must be present');

        this.id = id;
        this.fn = fn;
        this.errorHandler = errorHandler ?? this.defaultErrorHandler();
    }

    private defaultErrorHandler(): Fn<Error> {
        return (e: Error): void => {
            console.log(`[Job ID : ${this.id}] Error : ${e.message}`);
        }
    }

    abstract run(): void
}


export class TaskSync extends Task {

    protected readonly fn: FnSync;

    run(): void {
        try {
            this.fn();
        }
        catch (e) {
            this.errorHandler(e);
        }
    }
}


export class TaskAsync extends Task {

    protected readonly fn: FnAsync;

    run(): void {
        this.fn().catch(this.errorHandler);
    }
}

