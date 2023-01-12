import React from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import Home from "./components/Home";

const clientId =
	"199690433841-kgotjmmnmq06lfvso433pm39chpdt1a1.apps.googleusercontent.com";

export default function App() {
	return (
		<GoogleOAuthProvider clientId={clientId}>
			<Login />
		</GoogleOAuthProvider>
	);
}
