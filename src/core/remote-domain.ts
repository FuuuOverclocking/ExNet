import { Domain } from './types';

export class RemoteDomain implements Domain {
    public readonly isLocal: false = false;

    constructor(
        /** Domain ID uniquely identifies a domain among interconnected domains. */
        public readonly id: string,
        /** Every time the program re-runs, `runID` is randomly generated. */
        public readonly runID: string,
    ) {}
}
