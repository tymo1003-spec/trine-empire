const fs = require('fs');
const content = fs.readFileSync('server.js', 'utf8');
let braces = 0;
content.split('\n').forEach((line, i) => {
    for (let char of line) {
        if (char === '{') braces++;
        if (char === '}') braces--;
    }
    if (braces < 0) console.log(`Зайва закриваюча дужка на рядку ${i + 1}`);
});
console.log(`Баланс фігурних дужок (має бути 0): ${braces}`);

