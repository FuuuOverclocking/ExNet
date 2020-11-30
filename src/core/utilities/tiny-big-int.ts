const hasNativeBigInt =
    typeof BigInt !== 'undefined' && typeof BigInt(0) === 'bigint';
const maxSafeInt = 9007199254740991;

/**
 * TinyBigInt can used for 0 and arbitrarily large positive integers.
 */
export class TinyBigInt {
    public value: bigint | number | number[];

    /**
     * NOTE: `value` must be a natural number and <= MAX_SAFE_INT.
     */
    constructor(num: number | TinyBigInt) {
        if (typeof num === 'number') {
            this.value = hasNativeBigInt ? BigInt(num) : num;
            return;
        }
        if (hasNativeBigInt) {
            this.value = num.value;
            return;
        }
        this.value = Array.isArray(num.value) ? num.value.slice() : num.value;
    }

    public toString(): string {
        if (hasNativeBigInt || typeof this.value === 'number') {
            return this.value.toString();
        }
        return (this.value as number[]).slice().reverse().join('_');
    }

    public equal(num: number | TinyBigInt): boolean {
        if (typeof num === 'number') return this.value == num;
        if (hasNativeBigInt) return this.value === num.value;
        if (typeof num.value === 'number') return this.value === num.value;
        if (typeof this.value === 'number') return false;

        const val1 = this.value as number[];
        const val2 = num.value as number[];
        const len = val1.length;
        if (len !== val2.length) return false;

        for (let bit = 0; bit < len; ++bit) {
            if (val1[bit] !== val2[bit]) return false;
        }
        return true;
    }

    /**
     * NOTE: `num` must be a natural number and <= MAX_SAFE_INT.
     */
    public add(num: number): void {
        if (hasNativeBigInt) {
            (this.value as bigint) += BigInt(num);
            return;
        }
        if (typeof this.value === 'number') {
            let val = this.value;
            const rest = maxSafeInt - val;
            if (num <= rest) {
                this.value = val + num;
                return;
            }
            val -= maxSafeInt + 1;
            val += num;
            this.value = [val, 1];
            return;
        }
        let bit = 0;
        while (true) {
            let val = (this.value as number[])[bit];
            const rest = maxSafeInt - val;
            if (num <= rest) {
                (this.value as number[])[bit] = val + num;
                return;
            }
            val -= maxSafeInt + 1;
            val += num;
            (this.value as number[])[bit] = val;

            if (bit === (this.value as number[]).length - 1) {
                (this.value as number[]).push(1);
                return;
            }
            num = 1;
            bit++;
        }
    }

    public addOne(): void {
        this.add(1);
    }
}
