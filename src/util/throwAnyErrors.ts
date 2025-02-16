export default function throwAnyErrors(errors: unknown) {
    if (!errors) return;
    if (errors instanceof Array) {
        if (errors.length === 0) return;
        let msg = "Error:\n\n" + errors[0];
        if (errors.length === 1) {
            // eslint-disable-next-line no-console
            console.error("Error", errors[0]);
        } else {
            // eslint-disable-next-line no-console
            console.error("Errors", errors);
            msg += `\n\nPlus ${errors.length - 1} more.`;
        }
        throw new Error(msg);
    } else {
        // eslint-disable-next-line no-console
        console.error("Error:\n\n", errors);
        throw new Error(errors.toString());
    }
}
