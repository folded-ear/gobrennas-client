import { SidebarDrawer } from "@/global/components/Sidebar";
import { LibrarySearchController } from "@/features/LibrarySearch/LibrarySearchController";
import useIsDevMode from "@/data/useIsDevMode";

export const LibrarySearchSidebar = () => {
    const devMode = useIsDevMode();
    return devMode ? (
        <SidebarDrawer>
            <LibrarySearchController />
        </SidebarDrawer>
    ) : null;
};
