import { Maybe } from "graphql/jsutils/Maybe";
import { createContext, PropsWithChildren, useContext, useState } from "react";

export const SCALE_OPTIONS = [
    { label: "¼", value: 0.25 },
    { label: "½", value: 0.5 },
    { label: "1", value: 1 },
    { label: "2", value: 2 },
];

const ScaleContext = createContext<number>(1);

const SetScaleContext = createContext<Maybe<(scale: number) => void>>(null);

/**
 * Creates a new scaling context, initially scaled to 1 (no scaling).
 */
export const ScalingProvider = ({ children }: PropsWithChildren) => {
    const [scale, setScale] = useState(1);
    return (
        <ScaleContext.Provider value={scale}>
            <SetScaleContext.Provider value={setScale}>
                {children}
            </SetScaleContext.Provider>
        </ScaleContext.Provider>
    );
};

/**
 * If a scaling context is already open, do nothing. Otherwise, create a new one
 * as if ScalingProvider had been called.
 */
export const ReentrantScalingProvider = ({ children }: PropsWithChildren) => {
    const ctx = useContext(SetScaleContext);
    return ctx == null ? (
        <ScalingProvider>{children}</ScalingProvider>
    ) : (
        <>{children}</>
    );
};

/**
 * Returns the current context's scaling factor, or 1 (no scaling) if outside a
 * scaling context.
 */
export const useScale = () => useContext(ScaleContext);

export const useScaleOptions = (noScaling?: boolean) => {
    let found = false;
    const value = useScale();
    const set = useContext(SetScaleContext);
    if (noScaling) return [];
    if (set == null) {
        throw new TypeError(
            "useScaleOptions must be used w/in a scaling context.",
        );
    }
    const opts = SCALE_OPTIONS.map((it) => {
        if (it.value === value) {
            found = true;
            return { ...it, active: true };
        } else {
            return { ...it, active: false };
        }
    });
    if (!found) {
        opts.push({ value, label: "" + value, active: true });
    }
    return opts.map((it) => ({
        ...it,
        select: () => set(it.value),
    }));
};
