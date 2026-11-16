export enum TokenKind {
    // TODO: change back to ints for slight optimization
    DASH = "DASH",
    INDENT_INCREASE = "INDENT_INCREASE",
    INDENT_DECREASE = "INDENT_DECREASE",
    NEWLINE = "NEWLINE",
    WHITESPACE = "WHITESPACE",
    INT_LITERAL = "INT_LITERAL",
    FLOAT_LITERAL = "FLOAT_LITERAL",
    STRING_LITERAL = "STRING_LITERAL",
    DATE_LITERAL = "DATE_LITERAL",
    WORD = "WORD",
    COLON = "COLON",
    COMMA = "COMMA",
    LIST_OPEN = "LIST_OPEN",
    LIST_CLOSE = "LIST_CLOSE",
    MAP_OPEN = "MAP_OPEN",
    MAP_CLOSE = "MAP_CLOSE",
    TAG = "TAG",
}

const TOKEN_KIND_REGEXES: [TokenKind, RegExp][] = [
    [TokenKind.DASH, /^-/],
    [TokenKind.WHITESPACE, /^\s+/],
    [TokenKind.INT_LITERAL, /^-?[0-9]+/],
    [TokenKind.FLOAT_LITERAL, /^-?[0-9]+\.[0-9]+/],
    [TokenKind.STRING_LITERAL, /^(\"(\\.|[^"\\])*\")|(\'(\\.|[^'\\])*\')/],
    [TokenKind.DATE_LITERAL, /^[0-9]{4}-[0-9]{2}-[0-9]{2}/],
    [TokenKind.WORD, /^[a-zA-Z_\-()]+/],
    [TokenKind.COLON, /^:/],
    [TokenKind.COMMA, /^,/],
    [TokenKind.LIST_OPEN, /^\[/],
    [TokenKind.LIST_CLOSE, /^]/],
    [TokenKind.MAP_OPEN, /^{/],
    [TokenKind.MAP_CLOSE, /^}/],
    [TokenKind.TAG, /^!![a-z]+([a-z:./])*/]
];

export class Token {
    public readonly kind: TokenKind;
    public readonly src: string;

    public constructor(kind: TokenKind, src: string) {
        this.kind = kind;
        this.src = src;
    }

    public toString() {
        return `${TokenKind[this.kind]} Token ${JSON.stringify(this.src)}`
    }
}

function tokenizeLine(line: string): Token[] {
    const out: Token[] = [];

    while (line) {
        let longestMatch: Token | undefined = undefined;
        for (const [k, regex] of TOKEN_KIND_REGEXES) {
            const match = line.match(regex)?.[0];
            if (match) {
                const t = new Token(k, match);
                if (!longestMatch || t.src.length > longestMatch.src.length) longestMatch = t;
            }
        }

        if (!longestMatch) throw SyntaxError("failed to tokenize at " + line);

        out.push(longestMatch);
        line = line.substring(longestMatch.src.length);
    }

    return out;
}


export function tokenizeYAML(source: string): Token[] {
    let indents: number[] = [0];
    let out: Token[] = [];

    const lines = source.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i]!;

        let trimmedLine = line.trimStart();
        let currIndent = line.length - trimmedLine.length;

        const lineTokens = tokenizeLine(trimmedLine);

        if (out && i !== lines.length - 1) lineTokens.push(new Token(TokenKind.NEWLINE, '\n'));
        if (currIndent > indents.at(-1)!) {
            lineTokens.unshift(new Token(TokenKind.INDENT_INCREASE, ' '.repeat(currIndent)));
            indents.push(currIndent);
        }
        else while (currIndent < indents.at(-1)!) {
            lineTokens.unshift(new Token(TokenKind.INDENT_DECREASE, ' '.repeat(currIndent)));
            indents.pop();
        }

        out.push(...lineTokens);
    }

    return out;
}