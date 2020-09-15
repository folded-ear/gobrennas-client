let lastUserActionTS = null;

export const userAction = () =>
    lastUserActionTS = Date.now();

export const msSinceUserAction = () =>
    Date.now() - lastUserActionTS;

export const userActedWithin = ms =>
    msSinceUserAction() < ms;

userAction(); // loading the app!