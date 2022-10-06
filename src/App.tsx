import React, { useState, useEffect, useContext, createContext } from "react";
import Dashboard from "./dashboard";
import { AuthenticationPage } from "./login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";

const initialState = {
  isLoading: true,
  isSignout: false,
  userToken: null
}

type initState = {
  isLoading?: boolean;
  isSignout?: boolean;
  userToken?: any;
}


type ActionType = 
  | { type: "RESTORE_TOKEN", token?: any }
  | { type: 'SIGN_IN', token?: any }
  | { type: 'SIGN_OUT', token?: any  };


export const AuthContext = createContext<{state: initState; dispatch: React.Dispatch<ActionType>}>({
    state:initialState,
    dispatch: () => {}
  });


  function AuthReducer(state: initState, action: ActionType):initState {
    switch (action.type){
      case 'RESTORE_TOKEN':
        return {
          ...state,
          isLoading: false,
          userToken: action.token
        };
  
      case 'SIGN_IN':
        localStorage.setItem('shanta-gold-access-token', action.token);
        return {
          ...state,
          isSignout: false,
          userToken: action.token
        };
  
      case 'SIGN_OUT':
        localStorage.removeItem('shanta-gold-access-token');
        return {
          ...state,
          isSignout: true,
          userToken: null
        };
  
      default:
        return state;
    }
  }
export default function App(){
  const [state, dispatch] = React.useReducer(
    AuthReducer,
    initialState
  );

  React.useEffect(() => {
    const bootstrapAsync = () => {
      let userToken;
      try{
        userToken = localStorage.getItem('shanta-gold-access-token');
      } catch(e){
        console.log(e);
      }
      dispatch({type: 'RESTORE_TOKEN', token: userToken});
    }


    bootstrapAsync();
  }, []);

  const LoaderPage = () => {
    return (
      <Center my={'20%'}>
        <Loader variant='dots' />
        </Center>
    )
  }

  const AuthPage = () => {
    return (
      <Navigate to={"/dashboard"} />
    )
  }

  const UnauthPage = () => {
    return (
      <Navigate to={"/"} />
    )
  }
  return (
    <AuthContext.Provider value={{state, dispatch}}>
      {state.isLoading ? (
        <LoaderPage />
      ) : (
        <BrowserRouter>
        <Routes>
          <Route path="/" element={state.userToken === null ? <AuthenticationPage /> : <AuthPage />} />
          <Route path="/dashboard" element={state.userToken === null ? <UnauthPage /> : <Dashboard />} />
          <Route path="*" element={state.userToken === null ? <UnauthPage /> : <AuthPage />} />
        </Routes>
        </BrowserRouter>
      )}
    </AuthContext.Provider>
  )
}