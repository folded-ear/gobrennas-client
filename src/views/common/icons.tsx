import SvgIcon from "@mui/material/SvgIcon";
import React from "react";

export type { SvgIconComponent } from "@mui/icons-material";
export {
    // sorted by export name (i.e., `head -n <last> src/views/common/icons.tsx | tail +<first> | sort -k3`)
    Add as AddIcon,
    AddAPhotoOutlined as AddPhotoIcon,
    PostAdd as AddRecipeIcon,
    CalendarMonth as AddToCalendarIcon,
    AutoAwesome as AutoAwesomeIcon,
    BackspaceOutlined as BackspaceIcon,
    Cancel as CancelIcon,
    Check as CheckIcon,
    CheckBoxOutlineBlankOutlined as CheckboxOffIcon,
    CheckBoxOutlined as CheckboxOnIcon,
    Clear as ClearIcon,
    Close as CloseIcon,
    ArrowRight as CollapseIcon,
    MergeType as CombineIcon,
    Kitchen as CookIcon,
    FileCopy as CopyIcon,
    DeleteForeverOutlined as DeleteIcon,
    Laptop as DesktopIcon,
    ArrowDropDown as DropDownIcon,
    Edit as EditIcon,
    ErrorOutline as ErrorIcon,
    Star as FavoriteIcon,
    ArrowForward as ForwardIcon,
    AddToPhotos as GenerateBucketsIcon,
    HelpOutline as HelpIcon,
    InfoOutlined as InfoIcon,
    InventoryOutlined as InventoryIcon,
    MenuBook as LibraryIcon,
    Link as LinkIcon,
    Logout as LogoutIcon,
    Menu as MenuClosedIcon,
    MenuOpen as MenuOpenIcon,
    Smartphone as MobileIcon,
    NavigateNext as NextPageIcon,
    ImageNotSupportedOutlined as NoPhotoIcon,
    StarBorder as NotFavoriteIcon,
    CheckCircleOutline as OkIcon,
    RamenDining as PantryItemAdminIcon,
    Pause as PauseIcon,
    EventNote as PlanIcon,
    PlayArrow as PlayIcon,
    Add as PlusIcon,
    NavigateBefore as PrevPageIcon,
    RadioButtonUnchecked as RadioOffIcon,
    RadioButtonChecked as RadioOnIcon,
    Replay as ResetIcon,
    RotateRight as RotateClockwiseIcon,
    RotateLeft as RotateCounterClockwiseIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    ExitToApp as SendToPlanIcon,
    Share as ShareIcon,
    ShoppingCart as ShopIcon,
    DynamicFeed as SortByBucketIcon,
    Stop as StopIcon,
    NoDrinks as SumthinsFuckyIcon,
    CleaningServices as SweepIcon,
    CameraAlt as TextractIcon,
    Timer as TimerIcon,
    LockOpen as UnlockedIcon,
    VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";

interface BarProps {
    y?: number;
}

const Bar: React.FC<BarProps> = ({ y = 12 }) => (
    <g transform={`translate(12, ${y})`}>
        <rect x={-10} y={-1} width={20} height={2} />
    </g>
);

interface CaretProps {
    y?: number;
    transform?: string;
}

const Caret: React.FC<CaretProps> = ({ y = 12, transform = "" }) => (
    <g transform={`translate(12, ${y})`}>
        <g transform={transform}>
            <polygon points={`-6,3 6,3 0,-3`} />
        </g>
    </g>
);

export const ExpandAll = () => (
    <SvgIcon>
        <Bar y={2} />
        <Caret y={7} transform="scale(0.8)" />
        <Caret y={17} transform="rotate(180) scale(0.8)" />
        <Bar y={22} />
    </SvgIcon>
);

export const CollapseAll = () => (
    <SvgIcon>
        <Caret y={6} transform="rotate(180)" />
        <Bar y={12} />
        <Caret y={18} />
    </SvgIcon>
);

export const Blank = () => <SvgIcon />;
