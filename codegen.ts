import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./schema.graphql",
    // schema: "http://localhost:8080/graphql",
    documents: [
        "src/**/*.tsx",
        "src/**/*.ts",
        "src/**/*.js",
    ],
    generates: {
        "./src/__generated__/": {
            preset: "client",
            presetConfig: {
                fragmentMasking: false,
                gqlTagName: "gql",
            },
            plugins: [],
            config: {
                dedupeFragments: true,
                immutableTypes: true,
            }
        }
    },
    ignoreNoDocuments: true,
};

export default config;
