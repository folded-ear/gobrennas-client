import { SidebarDrawer } from "@/global/components/Sidebar";
import { LibrarySearchController } from "@/features/LibrarySearch/LibrarySearchController";

export const LibrarySearchSidebar = () => {
    return (
        <SidebarDrawer>
            <LibrarySearchController />
        </SidebarDrawer>
    );
};
