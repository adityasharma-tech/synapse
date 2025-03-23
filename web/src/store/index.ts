import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import appReducer from './reducers/app.reducer'
import streamReducer from './reducers/stream.reducer'
// ...

// we are using redux-toolkit so we neet to declare a global state store where we can put all out states with actions
export const store = configureStore({
  reducer: {
    app: appReducer, // very basic app router to save user state and global app state
    stream: streamReducer // specifically for stream routes only
  }
})

// Infer the `RootState`,  `AppDispatch`, and `AppStore` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
export type AppStore = typeof store

// special exports only used for typescript with type declaration
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()