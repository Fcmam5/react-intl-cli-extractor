const Glob = require("glob");
const fs = require('fs');
var camelCase = require('lodash.camelcase');
const FORMATTED_MESSAGE_REGEX = /<\s*FormattedMessage.*\/>/g;

const sourceFolder = process.argv[2] || process.cwd();

let result = {};

Glob("**/*.js", { ignore: '__tests__/**', cwd: sourceFolder }, function (er, files) {
  if (files.length) {
    files.map(filePath => {
      const absolutePath = `${sourceFolder}/${filePath}`;

      const data = fs.readFileSync(absolutePath, 'utf8');

      // Add IDS to tags
      const newFileData = data.replace(FORMATTED_MESSAGE_REGEX, mtc => {
        return mtc.replace(/defaultMessage\=\"(.*?)\"/, (a, b) => {
          const id = `${filePath.replace('.js', '')}/${camelCase(b)}`;
          result[id] = b;
          return `id="${id}" ${a}`;
        });
      });

      // Rewrite the original file
      fs.writeFileSync(absolutePath, newFileData, 'utf8');
    });
    console.log(result);
    fs.writeFileSync(`${sourceFolder}/locales/source.json`, JSON.stringify(result, null, "\t"), 'utf8');
  }

});