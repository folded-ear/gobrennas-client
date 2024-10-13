const fetch = require("cross-fetch");
const fs = require("fs");

const [_, _1, apiUrl, outputFile] = process.argv;

fetch(apiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        variables: {},
        query: `{
        __schema {
          types {
            kind
            name
            possibleTypes { name }
          }
        }
      }`,
    }),
})
    // get the body
    .then((result) => result.json())
    // dissect the result
    .then((result) => {
        const possibleTypes = {};
        result.data.__schema.types.forEach((supertype) => {
            if (supertype.possibleTypes) {
                possibleTypes[supertype.name] = supertype.possibleTypes.map(
                    (subtype) => subtype.name,
                );
            }
        });
        return possibleTypes;
    })
    // ensure well-ordered
    .then((possibleTypes) =>
        Object.keys(possibleTypes)
            .sort()
            .reduce(
                (agg, type) => ({
                    ...agg,
                    [type]: possibleTypes[type].sort(),
                }),
                {},
            ),
    )
    // write it out
    .then((possibleTypes) => {
        fs.writeFile(
            outputFile,
            `/**
 * Generated by 'npm run possible-types'.
 */
export default ${JSON.stringify(possibleTypes, null, 2)};
`,
            (err) => {
                if (err) {
                    console.error("Error writing fragment types", err);
                } else {
                    console.log(
                        "Fragment types successfully extracted",
                        Object.keys(possibleTypes),
                    );
                }
            },
        );
    });
