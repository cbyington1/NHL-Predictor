import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
  isLoading: boolean
  darkMode: boolean
}

const initialState: AppState = {
  isLoading: false,
  darkMode: false
}

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setIsLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setDarkMode: (state, action: PayloadAction<boolean>) => {
      state.darkMode = action.payload
    }
  }
})

export const { setIsLoading, setDarkMode } = appSlice.actions
export default appSlice.reducer