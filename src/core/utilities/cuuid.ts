/**
 * Custom UUID based on time.  The first 8 characters of the result are converted
 * from UNIX timestamp (in millisecond), and then concatenate random strings of
 * specified length.
 *
 * The character set used in the generated string is [0-9a-zA-Z], except for
 * "l", "o", "I" and "O".  Because these 4 characters are confusing with 0 and 1.
 */
export function cuuid(randomPostfixLength = 8): string {
    const chars = '0123456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
    const charsLength = chars.length;
    const result: string[] = [];
    let num = Date.now();

    while (num > 0) {
        const digit = num % charsLength;
        num = Math.floor(num / charsLength);
        result.unshift(chars.charAt(digit));
    }

    for (let i = result.length; i < 8; ++i) {
        result.unshift(chars.charAt(0));
    }

    for (let i = 0; i < randomPostfixLength; ++i) {
        result.push(chars.charAt(Math.floor(Math.random() * charsLength)));
    }
    return result.join('');
}
