import type { ABC } from './types';
import { a, monitor } from './local-domain';

export const something = (): ABC => {
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(123);
    console.log(a);
    console.log(monitor);
    return (0 as any) as ABC;
};

export let env = 'prod';
if (process.env.NODE_ENV !== 'production') {
    env = 'dev';
}
