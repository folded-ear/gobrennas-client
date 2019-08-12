const RingUI = {}

/**
 * I provide access to the modules exported by the RingUI builder module. Yes,
 * it's empty. It'll get dynamically populated during application bootstrap, so
 * you can't destructure it during import in your module. Use a default import
 * and then dereference the module key off of it in your JSX:
 *
 * ```
 * import RingUI from "../util/ring-ui"
 * ...
 * render() {
 *   <RingUI.QueryAssist ... />
 * }
 * ```
 */
export default RingUI
