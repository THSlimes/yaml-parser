import type { Token, TokenKind } from "./tokenizing.mjs";

type ParseFunction<T> = (tokens: readonly Token[]) => [T, readonly Token[]];
export interface Parser<T> {
    parse: ParseFunction<T>
}

export default class ParseRule<T> implements Parser<T> {
    public readonly parse: ParseFunction<T>;

    private constructor(rule: ParseFunction<T>) {
        this.parse = rule;
    }

    public then<U>(next: Parser<U>): ParseRule<[T, U]> {
        return new ParseRule<[T, U]>(tokens => {
            let t: T, u: U;
            [t, tokens] = this.parse(tokens);
            [u, tokens] = next.parse(tokens);
            return [[t, u], tokens];
        });
    }

    public or<U>(other: Parser<U>): ParseRule<T | U> {
        return new ParseRule<T | U>(tokens => {
            try {
                return this.parse(tokens);
            }
            catch (_) {
                return other.parse(tokens);
            }
        });
    }

    public optional(): Parser<T | undefined> {
        return new ParseRule<T | undefined>(tokens => {
            try {
                return this.parse(tokens);
            }
            catch (_) {
                return [undefined, tokens];
            }
        });
    }

    public repeat(atLeast = 0, atMost = Infinity): ParseRule<T[]> {
        return new ParseRule<T[]>(tokens => {
            const origTokens = tokens;
            const vals: T[] = [];
            try {
                while (vals.length < atMost) {
                    let v: T;
                    [v, tokens] = this.parse(tokens);
                    vals.push(v);
                }
            }
            catch (_) { }

            if (vals.length < atLeast) throw new SyntaxError("too few matches");
            return [vals, tokens];
        });
    }

    public transform<U>(f: (t: T) => U): ParseRule<U> {
        return new ParseRule<U>(tokens => {
            const [t, rest] = this.parse(tokens);
            return [f(t), rest];
        });
    }


    public static pass<T>(val: T): ParseRule<T> {
        return new ParseRule(tokens => [val, tokens]);
    }

    public static fail(e: SyntaxError): ParseRule<never> {
        return new ParseRule(tokens => { throw e; });
    }

    public static accept(kind: TokenKind): ParseRule<Token> {
        return new ParseRule<Token>(tokens => {
            const fst = tokens[0];

            if (!fst) throw new SyntaxError("end of input");
            else if (fst.kind != kind) throw new SyntaxError("unexpected token kind");
            return [fst, tokens.slice(1)];
        });
    }

    public static accepts(...kinds: TokenKind[]): ParseRule<Token[]> {
        return new ParseRule(tokens => {
            if (tokens.length < kinds.length) throw SyntaxError("end of input");
            else if (kinds.some((k, i) => tokens[i]!.kind !== k)) throw SyntaxError("unexpected token kind(s)");
            return [tokens.slice(0, kinds.length), tokens.slice(kinds.length)];
        });
    }
}