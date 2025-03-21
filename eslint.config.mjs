import pluginJs from "@eslint/js";
import pluginReactHooks_nonFlat from "eslint-plugin-react-hooks";
import pluginJsxRuntimeConfig from "eslint-plugin-react/configs/jsx-runtime.js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import globals from "globals";
import tseslint from "typescript-eslint";

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
        ignores: ["**/__generated__/**/*", "scripts/**/*"],
    },
    {
        rules: {
            eqeqeq: ["error", "smart"],
            "no-console": "warn",
            "no-debugger": "warn",
            "no-prototype-builtins": "off",
            "no-restricted-globals": "warn",
            "no-restricted-imports": [
                "error",
                {
                    paths: [
                        {
                            name: "@mui/icons-material",
                            message: "Import icons from '@/views/common/icons'",
                        },
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
                    patterns: [
                        {
                            group: ["@mui/icons-material/*"],
                            message: "Import icons from '@/views/common/icons'",
                        },
                    ],
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
            semi: ["warn", "always"],
            "@typescript-eslint/no-explicit-any": "error",
            // "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "react/no-unescaped-entities": "warn",
            "react/no-deprecated": "warn",
        },
    },
];
