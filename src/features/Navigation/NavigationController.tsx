import * as React from "react";
import {
    AppBar,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    Toolbar,
} from "@mui/material";
import {
    EventNote as PlanIcon,
    Menu,
    MenuBook as LibraryIcon,
    ShoppingCart as ShopIcon,
    Timer as TimerIcon,
} from "@mui/icons-material";
import { styled } from "@mui/styles";

const Header = styled(AppBar)(({theme}) => ({
    border: "1px solid green",
    zIndex: theme.zIndex.drawer + 1,
}))

const Navigation = styled(Drawer)({
    border: "1px solid blue",
    width: "240px",
})

const Main = styled(Container)({
    backgroundColor: "red"
})

const Something = styled("div")({
    border: "1px solid gray"
})

export const NavigationController = () => {
    return (
        <>
            <Header>
                <Toolbar>
                    <Menu/>
                    <p>food software</p>
                </Toolbar>
            </Header>
            <Navigation variant="permanent">
                <List dense>
                    <ListItem>
                        <ListItemIcon>
                            <LibraryIcon/>
                        </ListItemIcon>
                        Library
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <PlanIcon/>
                        </ListItemIcon>
                        Plan
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <ShopIcon/>
                        </ListItemIcon>
                        Shop
                    </ListItem>
                    <ListItem>
                        <ListItemIcon>
                            <TimerIcon/>
                        </ListItemIcon>
                        Timers
                    </ListItem>
                </List>
            </Navigation>
        <Main>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque id nibh tortor id aliquet lectus proin nibh nisl. Amet nisl purus in mollis nunc sed id semper. Congue eu consequat ac felis donec et odio. Faucibus pulvinar elementum integer enim. Felis donec et odio pellentesque diam. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Lorem dolor sed viverra ipsum nunc aliquet. Nec tincidunt praesent semper feugiat nibh sed.</p>
        <p>Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Purus in mollis nunc sed id semper risus in. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Id semper risus in hendrerit gravida. Aliquet risus feugiat in ante metus dictum at tempor commodo. Amet mauris commodo quis imperdiet. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Sed adipiscing diam donec adipiscing tristique risus nec feugiat. Sit amet consectetur adipiscing elit. In cursus turpis massa tincidunt dui ut. Nibh mauris cursus mattis molestie.</p>
        <p>Mauris cursus mattis molestie a iaculis at. Aliquet sagittis id consectetur purus ut. Porttitor lacus luctus accumsan tortor posuere ac ut. Orci dapibus ultrices in iaculis nunc. Ultrices sagittis orci a scelerisque purus semper eget duis. Vulputate ut pharetra sit amet aliquam. Duis ut diam quam nulla. Sit amet commodo nulla facilisi nullam vehicula. Ornare arcu odio ut sem nulla. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus. Non sodales neque sodales ut etiam sit amet nisl.</p>
        <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Id nibh tortor id aliquet lectus proin nibh nisl condimentum. Arcu dictum varius duis at. Arcu bibendum at varius vel pharetra. Montes nascetur ridiculus mus mauris vitae ultricies. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Pharetra vel turpis nunc eget lorem dolor. Dictum varius duis at consectetur lorem donec massa sapien. Magna eget est lorem ipsum dolor sit amet. Feugiat scelerisque varius morbi enim nunc. Eu scelerisque felis imperdiet proin fermentum. Augue neque gravida in fermentum et sollicitudin.</p>
        <p>Sapien eget mi proin sed libero enim sed faucibus turpis. Facilisi cras fermentum odio eu feugiat pretium. Vivamus at augue eget arcu dictum. In pellentesque massa placerat duis ultricies lacus sed turpis. Tristique nulla aliquet enim tortor at auctor urna nunc id. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Euismod lacinia at quis risus sed vulputate odio. Nec feugiat nisl pretium fusce. Felis eget velit aliquet sagittis id consectetur purus. A scelerisque purus semper eget duis. Odio pellentesque diam volutpat commodo sed. Ultrices eros in cursus turpis massa tincidunt. Arcu cursus vitae congue mauris rhoncus. Nibh tellus molestie nunc non blandit massa. Enim lobortis scelerisque fermentum dui faucibus in. Lacus sed viverra tellus in hac. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Lectus nulla at volutpat diam ut venenatis. Sed blandit libero volutpat sed cras.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque id nibh tortor id aliquet lectus proin nibh nisl. Amet nisl purus in mollis nunc sed id semper. Congue eu consequat ac felis donec et odio. Faucibus pulvinar elementum integer enim. Felis donec et odio pellentesque diam. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Lorem dolor sed viverra ipsum nunc aliquet. Nec tincidunt praesent semper feugiat nibh sed.</p>
        <p>Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Purus in mollis nunc sed id semper risus in. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Id semper risus in hendrerit gravida. Aliquet risus feugiat in ante metus dictum at tempor commodo. Amet mauris commodo quis imperdiet. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Sed adipiscing diam donec adipiscing tristique risus nec feugiat. Sit amet consectetur adipiscing elit. In cursus turpis massa tincidunt dui ut. Nibh mauris cursus mattis molestie.</p>
        <p>Mauris cursus mattis molestie a iaculis at. Aliquet sagittis id consectetur purus ut. Porttitor lacus luctus accumsan tortor posuere ac ut. Orci dapibus ultrices in iaculis nunc. Ultrices sagittis orci a scelerisque purus semper eget duis. Vulputate ut pharetra sit amet aliquam. Duis ut diam quam nulla. Sit amet commodo nulla facilisi nullam vehicula. Ornare arcu odio ut sem nulla. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus. Non sodales neque sodales ut etiam sit amet nisl.</p>
        <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Id nibh tortor id aliquet lectus proin nibh nisl condimentum. Arcu dictum varius duis at. Arcu bibendum at varius vel pharetra. Montes nascetur ridiculus mus mauris vitae ultricies. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Pharetra vel turpis nunc eget lorem dolor. Dictum varius duis at consectetur lorem donec massa sapien. Magna eget est lorem ipsum dolor sit amet. Feugiat scelerisque varius morbi enim nunc. Eu scelerisque felis imperdiet proin fermentum. Augue neque gravida in fermentum et sollicitudin.</p>
        <p>Sapien eget mi proin sed libero enim sed faucibus turpis. Facilisi cras fermentum odio eu feugiat pretium. Vivamus at augue eget arcu dictum. In pellentesque massa placerat duis ultricies lacus sed turpis. Tristique nulla aliquet enim tortor at auctor urna nunc id. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Euismod lacinia at quis risus sed vulputate odio. Nec feugiat nisl pretium fusce. Felis eget velit aliquet sagittis id consectetur purus. A scelerisque purus semper eget duis. Odio pellentesque diam volutpat commodo sed. Ultrices eros in cursus turpis massa tincidunt. Arcu cursus vitae congue mauris rhoncus. Nibh tellus molestie nunc non blandit massa. Enim lobortis scelerisque fermentum dui faucibus in. Lacus sed viverra tellus in hac. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Lectus nulla at volutpat diam ut venenatis. Sed blandit libero volutpat sed cras.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque id nibh tortor id aliquet lectus proin nibh nisl. Amet nisl purus in mollis nunc sed id semper. Congue eu consequat ac felis donec et odio. Faucibus pulvinar elementum integer enim. Felis donec et odio pellentesque diam. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Lorem dolor sed viverra ipsum nunc aliquet. Nec tincidunt praesent semper feugiat nibh sed.</p>
        <p>Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Purus in mollis nunc sed id semper risus in. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Id semper risus in hendrerit gravida. Aliquet risus feugiat in ante metus dictum at tempor commodo. Amet mauris commodo quis imperdiet. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Sed adipiscing diam donec adipiscing tristique risus nec feugiat. Sit amet consectetur adipiscing elit. In cursus turpis massa tincidunt dui ut. Nibh mauris cursus mattis molestie.</p>
        <p>Mauris cursus mattis molestie a iaculis at. Aliquet sagittis id consectetur purus ut. Porttitor lacus luctus accumsan tortor posuere ac ut. Orci dapibus ultrices in iaculis nunc. Ultrices sagittis orci a scelerisque purus semper eget duis. Vulputate ut pharetra sit amet aliquam. Duis ut diam quam nulla. Sit amet commodo nulla facilisi nullam vehicula. Ornare arcu odio ut sem nulla. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus. Non sodales neque sodales ut etiam sit amet nisl.</p>
        <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Id nibh tortor id aliquet lectus proin nibh nisl condimentum. Arcu dictum varius duis at. Arcu bibendum at varius vel pharetra. Montes nascetur ridiculus mus mauris vitae ultricies. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Pharetra vel turpis nunc eget lorem dolor. Dictum varius duis at consectetur lorem donec massa sapien. Magna eget est lorem ipsum dolor sit amet. Feugiat scelerisque varius morbi enim nunc. Eu scelerisque felis imperdiet proin fermentum. Augue neque gravida in fermentum et sollicitudin.</p>
        <p>Sapien eget mi proin sed libero enim sed faucibus turpis. Facilisi cras fermentum odio eu feugiat pretium. Vivamus at augue eget arcu dictum. In pellentesque massa placerat duis ultricies lacus sed turpis. Tristique nulla aliquet enim tortor at auctor urna nunc id. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Euismod lacinia at quis risus sed vulputate odio. Nec feugiat nisl pretium fusce. Felis eget velit aliquet sagittis id consectetur purus. A scelerisque purus semper eget duis. Odio pellentesque diam volutpat commodo sed. Ultrices eros in cursus turpis massa tincidunt. Arcu cursus vitae congue mauris rhoncus. Nibh tellus molestie nunc non blandit massa. Enim lobortis scelerisque fermentum dui faucibus in. Lacus sed viverra tellus in hac. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Lectus nulla at volutpat diam ut venenatis. Sed blandit libero volutpat sed cras.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque id nibh tortor id aliquet lectus proin nibh nisl. Amet nisl purus in mollis nunc sed id semper. Congue eu consequat ac felis donec et odio. Faucibus pulvinar elementum integer enim. Felis donec et odio pellentesque diam. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Lorem dolor sed viverra ipsum nunc aliquet. Nec tincidunt praesent semper feugiat nibh sed.</p>
        <p>Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Purus in mollis nunc sed id semper risus in. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Id semper risus in hendrerit gravida. Aliquet risus feugiat in ante metus dictum at tempor commodo. Amet mauris commodo quis imperdiet. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Sed adipiscing diam donec adipiscing tristique risus nec feugiat. Sit amet consectetur adipiscing elit. In cursus turpis massa tincidunt dui ut. Nibh mauris cursus mattis molestie.</p>
        <p>Mauris cursus mattis molestie a iaculis at. Aliquet sagittis id consectetur purus ut. Porttitor lacus luctus accumsan tortor posuere ac ut. Orci dapibus ultrices in iaculis nunc. Ultrices sagittis orci a scelerisque purus semper eget duis. Vulputate ut pharetra sit amet aliquam. Duis ut diam quam nulla. Sit amet commodo nulla facilisi nullam vehicula. Ornare arcu odio ut sem nulla. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus. Non sodales neque sodales ut etiam sit amet nisl.</p>
        <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Id nibh tortor id aliquet lectus proin nibh nisl condimentum. Arcu dictum varius duis at. Arcu bibendum at varius vel pharetra. Montes nascetur ridiculus mus mauris vitae ultricies. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Pharetra vel turpis nunc eget lorem dolor. Dictum varius duis at consectetur lorem donec massa sapien. Magna eget est lorem ipsum dolor sit amet. Feugiat scelerisque varius morbi enim nunc. Eu scelerisque felis imperdiet proin fermentum. Augue neque gravida in fermentum et sollicitudin.</p>
        <p>Sapien eget mi proin sed libero enim sed faucibus turpis. Facilisi cras fermentum odio eu feugiat pretium. Vivamus at augue eget arcu dictum. In pellentesque massa placerat duis ultricies lacus sed turpis. Tristique nulla aliquet enim tortor at auctor urna nunc id. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Euismod lacinia at quis risus sed vulputate odio. Nec feugiat nisl pretium fusce. Felis eget velit aliquet sagittis id consectetur purus. A scelerisque purus semper eget duis. Odio pellentesque diam volutpat commodo sed. Ultrices eros in cursus turpis massa tincidunt. Arcu cursus vitae congue mauris rhoncus. Nibh tellus molestie nunc non blandit massa. Enim lobortis scelerisque fermentum dui faucibus in. Lacus sed viverra tellus in hac. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Lectus nulla at volutpat diam ut venenatis. Sed blandit libero volutpat sed cras.</p>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Pellentesque id nibh tortor id aliquet lectus proin nibh nisl. Amet nisl purus in mollis nunc sed id semper. Congue eu consequat ac felis donec et odio. Faucibus pulvinar elementum integer enim. Felis donec et odio pellentesque diam. Ullamcorper a lacus vestibulum sed arcu non odio euismod lacinia. Vivamus arcu felis bibendum ut tristique et egestas quis ipsum. Ac feugiat sed lectus vestibulum mattis ullamcorper velit sed. Lorem dolor sed viverra ipsum nunc aliquet. Nec tincidunt praesent semper feugiat nibh sed.</p>
        <p>Nunc aliquet bibendum enim facilisis gravida neque convallis a cras. Purus in mollis nunc sed id semper risus in. Hendrerit dolor magna eget est lorem ipsum dolor sit amet. Id semper risus in hendrerit gravida. Aliquet risus feugiat in ante metus dictum at tempor commodo. Amet mauris commodo quis imperdiet. Cras semper auctor neque vitae tempus quam pellentesque nec nam. Sed adipiscing diam donec adipiscing tristique risus nec feugiat. Sit amet consectetur adipiscing elit. In cursus turpis massa tincidunt dui ut. Nibh mauris cursus mattis molestie.</p>
        <p>Mauris cursus mattis molestie a iaculis at. Aliquet sagittis id consectetur purus ut. Porttitor lacus luctus accumsan tortor posuere ac ut. Orci dapibus ultrices in iaculis nunc. Ultrices sagittis orci a scelerisque purus semper eget duis. Vulputate ut pharetra sit amet aliquam. Duis ut diam quam nulla. Sit amet commodo nulla facilisi nullam vehicula. Ornare arcu odio ut sem nulla. Diam volutpat commodo sed egestas egestas fringilla phasellus faucibus. Non sodales neque sodales ut etiam sit amet nisl.</p>
        <p>Cras semper auctor neque vitae tempus quam pellentesque nec. Id nibh tortor id aliquet lectus proin nibh nisl condimentum. Arcu dictum varius duis at. Arcu bibendum at varius vel pharetra. Montes nascetur ridiculus mus mauris vitae ultricies. Nullam ac tortor vitae purus faucibus ornare suspendisse sed nisi. Pharetra vel turpis nunc eget lorem dolor. Dictum varius duis at consectetur lorem donec massa sapien. Magna eget est lorem ipsum dolor sit amet. Feugiat scelerisque varius morbi enim nunc. Eu scelerisque felis imperdiet proin fermentum. Augue neque gravida in fermentum et sollicitudin.</p>
        <p>Sapien eget mi proin sed libero enim sed faucibus turpis. Facilisi cras fermentum odio eu feugiat pretium. Vivamus at augue eget arcu dictum. In pellentesque massa placerat duis ultricies lacus sed turpis. Tristique nulla aliquet enim tortor at auctor urna nunc id. Mauris commodo quis imperdiet massa tincidunt nunc pulvinar sapien et. Euismod lacinia at quis risus sed vulputate odio. Nec feugiat nisl pretium fusce. Felis eget velit aliquet sagittis id consectetur purus. A scelerisque purus semper eget duis. Odio pellentesque diam volutpat commodo sed. Ultrices eros in cursus turpis massa tincidunt. Arcu cursus vitae congue mauris rhoncus. Nibh tellus molestie nunc non blandit massa. Enim lobortis scelerisque fermentum dui faucibus in. Lacus sed viverra tellus in hac. Ipsum dolor sit amet consectetur adipiscing elit ut aliquam purus. Metus aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Lectus nulla at volutpat diam ut venenatis. Sed blandit libero volutpat sed cras.</p>
    </Main>
        </>
    )
}