import { isPromise } from './index';

export class Asap {
    private static cancelSymbol = Symbol();

    public static tryCatch(
        tryFn: () => void | Promise<void>,
        catchFn: (e: any) => void,
    ): Asap {
        let result: void | symbol | Promise<void | symbol>;

        try {
            result = tryFn();
        } catch (e) {
            catchFn(e);
            result = Asap.cancelSymbol;
        }

        if (isPromise(result)) {
            result = result.catch((e) => {
                catchFn(e);
                return Asap.cancelSymbol;
            });
        }
        return new Asap(result);
    }

    constructor(
        /**
         * if `result` is not undefined, then it must be a `Promise`
         * in `pending` or `resolved` state, never in `rejected` state.
         */
        public result: void | symbol | Promise<void | symbol>,
    ) {}

    public thenTryCatch(
        tryFn: () => void | Promise<void>,
        catchFn: (e: any) => void,
    ): this {
        let result = this.result;

        if (isPromise(result)) {
            result = result
                .then((val) => {
                    if (val === Asap.cancelSymbol) return val;
                    return tryFn();
                })
                .catch((e) => {
                    catchFn(e);
                    return Asap.cancelSymbol;
                });
        } else if (result !== Asap.cancelSymbol) {
            try {
                result = tryFn();
            } catch (e) {
                catchFn(e);
                result = Asap.cancelSymbol;
            }

            if (isPromise(result)) {
                result = result.catch((e) => {
                    catchFn(e);
                    return Asap.cancelSymbol;
                });
            }
        }
        this.result = result;
        return this;
    }

    public static execFunctions<FuncArgs extends any[]>(
        functions: Array<(...args: FuncArgs) => void | Promise<void>>,
        ...args: FuncArgs
    ): void | Promise<void> {
        const len = functions.length;
        for (let i = 0; i < len; ++i) {
            const result = functions[i](...args);
            if (isPromise(result)) {
                return functions
                    .slice(i + 1)
                    .reduce(
                        (promise, fn) => promise.then(() => fn(...args)),
                        result,
                    );
            }
        }
    }
}
