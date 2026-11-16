import { TextLiteralNode } from "./ast.mjs";
import { preprocessYAML } from "./preprocessing.mjs";
import { tokenizeYAML } from "./tokenizing.mjs";

console.log("hi");


// let source = `
// # Double nested configuration: company -> departments -> teams
// company: "TechNova Solutions"
// location: "Amsterdam"

// # First Level of Nesting (departments)
// departments:
//   engineering:
//     head: "Alex Chen"
//     budget: 500000

//     # Second Level of Nesting (teams inside engineering)
//     teams:
//       frontend:
//         lead: "Sarah Jenkins"
//         members: 5
//         technologies:
//           - React
//           - TypeScript
//       backend:
//         lead: "Marcus Vance"
//         members: 8
//         technologies:
//           - Python
//           - Go
//           - PostgreSQL

//   marketing:
//     head: "Elena Rostova"
//     budget: 250000

//     # Second Level of Nesting (teams inside marketing)
//     teams:
//       social_media:
//         lead: "Tom Diaz"
//         channels:
//           - LinkedIn
//           - YouTube
// `;

let source = `hello: "world"`;


console.log("Before preprocessing:");
console.log(source);

console.log("After preprocessing:");
source = preprocessYAML(source);

console.log("Lines:");
console.log(source.split('\n'));

console.log("Tokens:");
const tokens = tokenizeYAML(source);
for (const token of tokens) console.log(token.toString());

console.log(TextLiteralNode.parse(tokens));
