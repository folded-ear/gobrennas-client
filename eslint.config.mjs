import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginJsxRuntimeConfig from "eslint-plugin-react/configs/jsx-runtime.js";
import pluginReactHooks_nonFlat from "eslint-plugin-react-hooks";

export default [
    { settings: { react: { version: "detect" } } },
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReactConfig,
    pluginJsxRuntimeConfig,
    {
        plugins: {
            "react-hooks": pluginReactHooks_nonFlat,
        },
        rules: pluginReactHooks_nonFlat.configs.recommended.rules,
    },
    {
        ignores: ["**/__generated__/**/*"],
    },
    {
        rules: {
            "no-console": 1,
            "no-debugger": "warn",
            "no-prototype-builtins": 0,
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        "@mui/icons-material",
                        {
                            name: "@apollo/client",
                            importNames: ["gql"],
                            message: "Import 'gql' from '@/__generated__'",
                        },
                        {
                            name: "@/__generated__/graphql",
                            importNames: ["Maybe"],
                            message:
                                "Import 'Maybe' from 'graphql/jsutils/Maybe'",
                        },
                    ],
                    patterns: ["@mui/icons-material/*"],
                },
            ],
            quotes: [
                "warn",
                "double",
                {
                    avoidEscape: true,
                    allowTemplateLiterals: true,
                },
            ],
            "react/prop-types": 1,
            semi: ["warn", "always"],
            "@typescript-eslint/no-explicit-any": 0,
            "@typescript-eslint/no-unsafe-assignment": 0,
            "react/no-unescaped-entities": 1,
            "react/no-deprecated": 1,
        },
    },
];
