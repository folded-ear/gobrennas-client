// noinspection JSUnusedGlobalSymbols
export default {
    entry: ["src/index.tsx"],
    project: ["src/**/*.*"],
    ignore: [
        // for debugging
        "src/util/logAction.ts",
        // for codegen
        "src/data/hooks/fragments.ts",
    ],
};
