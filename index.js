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
        const matchComponentID = mtc.match(/id=\"(.*?)\"/);

        if (matchComponentID) {
          // If the component has an ID, preserve that ID
          const id = matchComponentID[1];
          const matchDefaultMessage = mtc.match(/defaultMessage\=\"(.*?)\"/);
          // Component have only id="" without defaultMessage
          if (matchDefaultMessage) {
            result[id] = matchDefaultMessage[1];
          }
          return mtc;

        } else {
          // Add an id="" attribute to the component
          return mtc.replace(/defaultMessage\=\"(.*?)\"/, (a, b) => {
            const id = `${filePath.replace('.js', '')}/${camelCase(b)}`;
            result[id] = b;
            return `id="${id}" ${a}`;
          });
        }
      });

      // Rewrite the original file
      fs.writeFileSync(absolutePath, newFileData, 'utf8');
    });

    console.log(JSON.stringify(result, null, "\t"));

    fs.writeFileSync(`${sourceFolder}/locales/source.json`, JSON.stringify(result, null, "\t"), 'utf8');
  }

});