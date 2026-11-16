type QuoteChar = `'` | `"`;
function isQuoteChar(c: string): c is QuoteChar {
    return c === `'` || c === `"`;
}

const ESCAPE_CHAR = '\\';
function isEscaped(str: string, charIndex: number) {
    let numEscapeChars = 0;
    for (let i = charIndex - 1; i >= 0 && str[i] === ESCAPE_CHAR; i--) {
        numEscapeChars++;
    }

    return numEscapeChars % 2 == 1;
}

export function indexOfOutsideString(str: string, query: string): number {
    for (let i = 0; i < str.length; i++) {
        if (str.startsWith(query, i)) return i;

        const c = str[i]!;
        if (isQuoteChar(c) && !isEscaped(str, i)) { // start of string, skip to end
            i++;
            while (i < str.length && (str[i]! !== c || isEscaped(str, i))) i++;
        }
    }

    return -1;
}