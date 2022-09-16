import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppThunk, RootState } from "../store";
import { fetchLogin } from "../clients/LoginClient";

export interface LoginState {
    loggedIn: boolean;
    token: string;
    status: "idle" | "loading" | "failed";
}

const initialState: LoginState = {
    loggedIn: false,
    token: "",
    status: "idle",
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
export const loginAsync = createAsyncThunk(
    'login/fetchLogin',
    async (data: { user: string, password: string }) => {
        const response = await fetchLogin(data.user, data.password);
        // The value we return becomes the `fulfilled` action payload
        return response.data;
    }
);

export const loginSlice = createSlice({
    name: 'login',
    initialState,
    reducers: {
        // Use the PayloadAction type to declare the contents of `action.payload`
        logIn: (state, action: PayloadAction<string>) => {
            // Redux Toolkit allows us to write "mutating" logic in reducers. It
            // doesn't actually mutate the state because it uses the Immer library,
            // which detects changes to a "draft state" and produces a brand new
            // immutable state based off those changesƒ
            state.token = action.payload;
            state.loggedIn = true;
        },
        logOut: (state) => {
            state.loggedIn = false;
            state.token = "";
        }
    },
    // The `extraReducers` field lets the slice handle actions defined elsewhere,
    // including actions generated by createAsyncThunk or in other slices.
    extraReducers: (builder) => {
        builder
            .addCase(loginAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(loginAsync.fulfilled, (state, action) => {
                state.status = 'idle';
                state.token = action.payload;
                state.loggedIn = true;
            })
            .addCase(loginAsync.rejected, (state) => {
                state.status = 'failed';
                state.loggedIn = false;
                state.token = "";
            });
    },
});

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectToken = (state: RootState) => state.login.token;
export const selectLoggedIn = (state: RootState) => state.login.token != "" && state.login.loggedIn;

export const { logIn, logOut } = loginSlice.actions;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
export const logOutIfLoggedIn =
    (): AppThunk =>
        (dispatch, getState) => {
            const isLoggedIn = selectLoggedIn(getState());
            if (isLoggedIn) {
                dispatch(logOut());
            }
        };

export default loginSlice.reducer;