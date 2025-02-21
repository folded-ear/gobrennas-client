import SvgIcon from "@mui/material/SvgIcon";
import * as React from "react";

//eslint-disable-next-line no-restricted-imports
export {
    Add as AddIcon,
    Add as PlusIcon,
    AddAPhotoOutlined as AddPhotoIcon,
    ArrowDropDown as DropDownIcon,
    ArrowForward as ForwardIcon,
    AutoAwesome as AutoAwesomeIcon,
    CalendarMonth as AddToCalendarIcon,
    CameraAlt as TextractIcon,
    Cancel as CancelIcon,
    Check as CheckIcon,
    CheckBoxOutlineBlankOutlined as CheckboxOffIcon,
    CheckBoxOutlined as CheckboxOnIcon,
    CheckCircleOutline as OkIcon,
    CleaningServices as SweepIcon,
    Clear as ClearIcon,
    Close as CloseIcon,
    DataSaverOff as LoadingIcon,
    DateRange as GenerateBucketsIcon,
    DeleteForeverOutlined as DeleteIcon,
    DynamicFeed as SortByBucketIcon,
    Edit as EditIcon,
    EditNote as EditPlanNotes,
    ErrorOutline as ErrorIcon,
    EventNote as PlanIcon,
    ExitToApp as SendToPlanIcon,
    ExpandCircleDown as CollapseIcon,
    FileCopy as CopyIcon,
    HelpOutline as HelpIcon,
    ImageNotSupportedOutlined as NoPhotoIcon,
    Kitchen as CookIcon,
    Laptop as DesktopIcon,
    Link as LinkIcon,
    LockOpen as UnlockedIcon,
    Logout as LogoutIcon,
    Menu as MenuClosedIcon,
    MenuBook as LibraryIcon,
    MenuOpen as MenuOpenIcon,
    MergeType as CombineIcon,
    NavigateBefore as PrevPageIcon,
    NavigateNext as NextPageIcon,
    NoDrinks as SumthinsFuckyIcon,
    NotListedLocation as UnknownLocation,
    PostAdd as AddRecipeIcon,
    RadioButtonChecked as RadioOnIcon,
    RadioButtonUnchecked as RadioOffIcon,
    RamenDining as PantryItemAdminIcon,
    RotateLeft as RotateCounterClockwiseIcon,
    RotateRight as RotateClockwiseIcon,
    Save as SaveIcon,
    Search as SearchIcon,
    Share as ShareIcon,
    ShoppingCart as ShopIcon,
    Smartphone as MobileIcon,
    SoupKitchenOutlined as CookedItIcon,
    Star as FavoriteIcon,
    StarBorder as NotFavoriteIcon,
    VisibilityOutlined as ViewIcon,
} from "@mui/icons-material";
//eslint-disable-next-line no-restricted-imports
export type { SvgIconComponent } from "@mui/icons-material";

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
