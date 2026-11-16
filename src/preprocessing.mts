import { indexOfOutsideString } from "./util/string-util.mjs";

const COMMENT_CHAR = '#';

type PreprocessingStep = (lines: string[]) => string[];
const PREPROCESSING_STEPS: PreprocessingStep[] = [
    lines => lines.map(l => { // remove comments
        const commentIndex = indexOfOutsideString(l, COMMENT_CHAR);
        return commentIndex === -1 ? l : l.substring(0, commentIndex);
    }),
    lines => lines.map(l => l.trimEnd()), // trim line ends
    lines => lines.filter(l => l) // remove empty lines
];

export function preprocessYAML(source: string): string {
    let lines = source.split('\n');

    for (const step of PREPROCESSING_STEPS) lines = step(lines);

    return lines.join('\n');
}