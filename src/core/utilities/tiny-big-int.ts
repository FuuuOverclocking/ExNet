const hasNativeBigInt =
    typeof BigInt !== 'undefined' && typeof BigInt(0) === 'bigint';
const maxSafeInt = 9007199254740991;

const enum TinyBigIntType {
    bigint,
    number,
    numberArray,
}

/**
 * TinyBigInt can used for 0 and arbitrarily large positive integers.
 */
export class TinyBigInt {
    public value: bigint | number | number[];
    public type: TinyBigIntType;

    /**
     * NOTE: `value` must be a natural number and <= MAX_SAFE_INT.
     */
    constructor(value: number) {
        if (hasNativeBigInt) {
            this.value = BigInt(value);
            this.type = TinyBigIntType.bigint;
        } else {
            this.value = value;
            this.type = TinyBigIntType.number;
        }
    }

    public toString(): string {
        if (hasNativeBigInt || this.type === TinyBigIntType.number) {
            return this.value.toString();
        }
        return [...(this.value as number[])].reverse().join('_');
    }

    public equal(num: number | TinyBigInt): boolean {
        if (this.value === num) return true;
        if (typeof num === 'number') return false;
        if (hasNativeBigInt) return this.value === num.value;
        if (num.type === TinyBigIntType.number) return this.value === num.value;
        if (this.type !== TinyBigIntType.numberArray) return false;
        const val1 = this.value as number[];
        const val2 = num.value as number[];
        let bit = 0;
        while (true) {
            if (val1[bit] !== val2[bit]) return false;
            bit++;
            if (val1[bit] === void 0) {
                if (val2[bit] === void 0) return true;
                return false;
            }
            if (val2[bit] === void 0) return false;
        }
    }

    /**
     * NOTE: `num` must be a natural number and <= MAX_SAFE_INT.
     */
    public add(num: number): void {
        if (hasNativeBigInt) {
            (this.value as bigint) += BigInt(num);
            return;
        }
        if (this.type === TinyBigIntType.number) {
            let val = this.value as number;
            const rest = maxSafeInt - val;
            if (num <= rest) {
                (this.value as number) = val + num;
                return;
            }
            this.type = TinyBigIntType.numberArray;
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
                (this.value as any)[bit] = val + num;
                return;
            }
            val -= maxSafeInt + 1;
            val += num;
            (this.value as any)[bit] = val;

            if (bit === (this.value as any).length - 1) {
                (this.value as any).push(1);
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
