import ParseRule, { type Parser } from "./Parser.mjs";
import { Token, TokenKind } from "./tokenizing.mjs";

abstract class ParseNode {
    public readonly children: readonly ParseNode[];

    public constructor(children: readonly ParseNode[]) {
        this.children = children;
    }
}

abstract class LiteralNode<T> extends ParseNode {
    public readonly value: T;

    protected constructor(value: T) {
        super([]);
        this.value = value;
    }
}

export class IntLiteralNode extends LiteralNode<number> {
    private static readonly INT_LIT_PARSER = ParseRule.accept(TokenKind.INT_LITERAL).transform(t => new IntLiteralNode(Number(t.src)));

    private constructor(value: number) {
        super(value);
    }

    public static readonly parse = this.INT_LIT_PARSER.parse;
}

export class FloatLiteralNode extends LiteralNode<number> {
    private static readonly FLOAT_LIT_PARSER = ParseRule.accept(TokenKind.INT_LITERAL).transform(t => new FloatLiteralNode(Number(t.src)));

    private constructor(value: number) {
        super(value);
    }

    public static readonly parse = this.FLOAT_LIT_PARSER.parse;
}

export class DateLiteralNode extends LiteralNode<Date> {
    private static readonly DATE_LIT_PARSER = ParseRule.accept(TokenKind.INT_LITERAL).transform(t => new DateLiteralNode(new Date(t.src)));

    private constructor(value: Date) {
        super(value);
    }

    public static readonly parse = this.DATE_LIT_PARSER.parse;
}

export class TextLiteralNode extends LiteralNode<string> {
    private static readonly STRING_LIT_PARSER = ParseRule.accept(TokenKind.STRING_LITERAL).transform(strLit => new TextLiteralNode(strLit.src.slice(1, -1)));
    private static readonly WORDS_PARSER = ParseRule.accept(TokenKind.WORD).then(ParseRule.accept(TokenKind.WHITESPACE).or(ParseRule.accept(TokenKind.NEWLINE)).then(ParseRule.accept(TokenKind.WORD)).repeat()).transform(words => new TextLiteralNode(words.flat(2).map(t => t.src).join("")));
    private static readonly PARSE_RULE = this.STRING_LIT_PARSER.or(this.WORDS_PARSER);

    private constructor(value: string) {
        super(value);
    }

    public static readonly parse = this.PARSE_RULE.parse;
}