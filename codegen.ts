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
            plugins: [
                // one (or more?) of these creates duplicate Scalars declaration
                // "typescript",
                // "typescript-operations",
                // "typescript-resolvers",
            ],
            config: {
                avoidOptionals: true,
                dedupeFragments: true,
                immutableTypes: true,
            },
        },
    },
    ignoreNoDocuments: true,
};

export default config;
