import { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
    schema: "./schema.graphql",
    // schema: "http://localhost:8080/graphql",
    documents: ["src/**/*.tsx", "src/**/*.ts", "src/**/*.js"],
    generates: {
        "./src/__generated__/": {
            preset: "client",
            presetConfig: {
                fragmentMasking: false,
                gqlTagName: "gql",
            },
            plugins: [],
            config: {
                scalars: {
                    Date: "string",
                    DateTime: "string",
                    Long: "number",
                    NonNegativeFloat: "number",
                    NonNegativeInt: "number",
                    PositiveInt: "number",
                },
                namingConvention: {
                    enumValues: "keep",
                },
                avoidOptionals: true,
                dedupeFragments: true,
                immutableTypes: true,
            },
        },
    },
};

export default config;
