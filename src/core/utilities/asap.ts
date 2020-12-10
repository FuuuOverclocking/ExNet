import { It } from './it-is';

export namespace Asap {
    export type cancelToken = { __AsapCancelTokenBrand__: any };
}

export class Asap {
    public static readonly cancelToken: Asap.cancelToken = {} as any;

    public static tryCatch(
        tryFn: () => void | Asap.cancelToken | Promise<void | Asap.cancelToken>,
        catchFn: (e: any) => void,
    ): Asap {
        let result: void | Asap.cancelToken | Promise<void | Asap.cancelToken>;

        try {
            result = tryFn();
        } catch (e) {
            catchFn(e);
            result = Asap.cancelToken;
        }

        if (It.isPromise(result)) {
            result = result.catch((e) => {
                catchFn(e);
                return Asap.cancelToken;
            });
        }
        return new Asap(result);
    }

    constructor(
        /**
         * if `result` is not undefined, then it must be a `Promise`
         * in `pending` or `resolved` state, never in `rejected` state.
         */
        public result: void | Asap.cancelToken | Promise<void | Asap.cancelToken>,
    ) {}

    public thenTryCatch(
        tryFn: () => void | Asap.cancelToken | Promise<void | Asap.cancelToken>,
        catchFn: (e: any) => void,
    ): this {
        let result = this.result;

        if (It.isPromise(result)) {
            result = result
                .then((val) => {
                    if (val === Asap.cancelToken) return val;
                    return tryFn();
                })
                .catch((e) => {
                    catchFn(e);
                    return Asap.cancelToken;
                });
        } else if (result !== Asap.cancelToken) {
            try {
                result = tryFn();
            } catch (e) {
                catchFn(e);
                result = Asap.cancelToken;
            }

            if (It.isPromise(result)) {
                result = result.catch((e) => {
                    catchFn(e);
                    return Asap.cancelToken;
                });
            }
        }
        this.result = result;
        return this;
    }

    public static execFunctions<F extends (...args: any[]) => void | Promise<void>>(
        functions: F[],
        thisArg: ThisParameterType<F>,
        ...args: Parameters<F>
    ): void | Promise<void> {
        const len = functions.length;
        for (let i = 0; i < len; ++i) {
            const result = functions[i].apply(thisArg, args);
            if (It.isPromise(result)) {
                return functions
                    .slice(i + 1)
                    .reduce((promise, fn) => promise.then(() => fn.apply(thisArg, args)), result);
            }
        }
    }

    public static execFunctionsAndCheck<F extends (...args: any[]) => void | Promise<void>>(
        check: () => boolean,
        functions: readonly F[],
        thisArg: ThisParameterType<F>,
        ...args: Parameters<F>
    ): void | Promise<void> {
        const len = functions.length;
        let cancelled = false;
        let result: void | Promise<void>;

        for (let i = 0; i < len; ++i) {
            result = functions[i].apply(thisArg, args);
            if (!check()) return;

            if (It.isPromise(result)) {
                return functions.slice(i + 1).reduce(
                    (promise, fn) =>
                        promise.then(() => {
                            if (cancelled) return;
                            if (!check()) {
                                cancelled = true;
                                return;
                            }
                            return fn.apply(thisArg, args);
                        }),
                    result,
                );
            }
        }
    }
}
