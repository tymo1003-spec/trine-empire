const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
let braces = 0, parens = 0, brackets = 0;
let inBacktick = false, inSingleQuote = false, inDoubleQuote = false;

content.split('\n').forEach((line, i) => {
    for (let j = 0; j < line.length; j++) {
        let char = line[j];
        let prev = j > 0 ? line[j-1] : '';
        
        if (char === '`' && prev !== '\\') inBacktick = !inBacktick;
        if (char === "'" && prev !== '\\' && !inBacktick && !inDoubleQuote) inSingleQuote = !inSingleQuote;
        if (char === '"' && prev !== '\\' && !inBacktick && !inSingleQuote) inDoubleQuote = !inDoubleQuote;

        if (!inBacktick && !inSingleQuote && !inDoubleQuote) {
            if (char === '{') braces++;
            if (char === '}') braces--;
            if (char === '(') parens++;
            if (char === ')') parens--;
            if (char === '[') brackets++;
            if (char === ']') brackets--;
        }
    }
});

console.log(`Незакриті фігурні дужки {}: ${braces}`);
console.log(`Незакриті круглі дужки (): ${parens}`);
console.log(`Незакриті квадратні дужки []: ${brackets}`);
console.log(`Незакритий бектік (\`): ${inBacktick}`);
console.log(`Незакриті одинарні лапки ('): ${inSingleQuote}`);
console.log(`Незакриті подвійні лапки ("): ${inDoubleQuote}`);
