export default function debounce<T extends unknown[]>(
    fn: (...args: T) => void,
    delay: number = 100,
): (...args: T) => void {
    let timeout: number | null = null;
    return (...args: T) => {
        if (timeout != null) {
            window.clearTimeout(timeout);
        }
        timeout = window.setTimeout(() => {
            timeout = null;
            fn(...args);
        }, delay);
    };
}
