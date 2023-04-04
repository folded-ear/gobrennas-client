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
            plugins: [],
            config: {
                avoidOptionals: true,
            },
            presetConfig: {
                gqlTagName: "gql",
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
