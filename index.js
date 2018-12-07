const Glob = require("glob");
const fs = require('fs');
var camelCase = require('lodash.camelcase');
const sourceFolder = process.argv[2] || process.cwd();
const distFile = `${sourceFolder}/locales/source.json`;

/**
 * DEFAULT REGEX
 * TODO: Fix: It supports only " or '
 */
const FORMATTED_MESSAGE_REGEX = /<\s*FormattedMessage.*\/>/g;
const FORMAT_MESSAGE_REGEX = /formatMessage\((.*?)\)\}/g;
const DEFAULT_MESSAGE_ATTRIBUTE = /defaultMessage\=\"(.*?)\"/;
const DEFAULT_MESSAGE_PROPERTY = /defaultMessage\:\s*\'(.*?)\'/;
const ID_ATTRIBUTE = /id=\"(.*?)\"/;
const ID_PROPERTY = /id:\s*\'(.*?)\'/;

let result = {};

Glob("**/*.js", { ignore: '__tests__/**', cwd: sourceFolder }, function (er, files) {
  if (files.length) {
    files.map(filePath => {
      const absolutePath = `${sourceFolder}/${filePath}`;

      const data = fs.readFileSync(absolutePath, 'utf8');

      // Add IDS to tags (Components)

      let newFileData = data.replace(FORMATTED_MESSAGE_REGEX, mtc => {
        const matchComponentID = mtc.match(ID_ATTRIBUTE);

        if (matchComponentID) {
          // If the component has an ID, preserve that ID
          const id = matchComponentID[1];
          const matchDefaultMessage = mtc.match(DEFAULT_MESSAGE_ATTRIBUTE);
          // Component have only id="" without defaultMessage
          if (matchDefaultMessage) {
            result[id] = matchDefaultMessage[1];
          }
          return mtc;

        } else {
          // Add an id="" attribute to the component
          return mtc.replace(DEFAULT_MESSAGE_ATTRIBUTE, (a, b) => {
            const id = `${filePath.replace('.js', '')}/${camelCase(b)}`;
            result[id] = b;
            return `id="${id}" ${a}`;
          });
        }
      });

      // Add IDS to formatMessage() functions
      newFileData = newFileData.replace(FORMAT_MESSAGE_REGEX, (mtc, defaultTxt) => {
        const matchComponentID = mtc.match(ID_PROPERTY);

        if (matchComponentID) {
          const id = matchComponentID[1];
          const matchDefaultMessage = mtc.match(DEFAULT_MESSAGE_PROPERTY);
          if (matchDefaultMessage) {
            // The formatMessage() function has {id, defaultMessage}
            result[id] = matchDefaultMessage[1];
          }
          return mtc;
        } else {
          // Add an Id property to the object
          return mtc.replace(DEFAULT_MESSAGE_PROPERTY, (a, b) => {
            const id = `${filePath.replace('.js', '')}/${camelCase(b)}`;
            result[id] = b;
            return `id: '${id}', ${a}`;
          });
        }
      });

      // Rewrite the original file
      fs.writeFileSync(absolutePath, newFileData, 'utf8');
    });
    console.log("\x1b[33m%s\x1b[0m",
      `Finished, Exported ${Object.keys(result).length} message to: ${distFile}`);
    console.log(JSON.stringify(result, null, "\t"));

    fs.writeFileSync(distFile, JSON.stringify(result, null, "\t"), 'utf8');
  }

});