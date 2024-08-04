import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } } },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReactConfig,
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
                    paths: ["@mui/icons-material"],
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
            "react/react-in-jsx-scope": 1,
            "react/no-unescaped-entities": 1,
            "react/no-deprecated": 1,
        },
    },
];
