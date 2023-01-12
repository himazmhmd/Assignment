import { React, useState, useEffect } from "react";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";

const clientId =
	"199690433841-kgotjmmnmq06lfvso433pm39chpdt1a1.apps.googleusercontent.com";
var div;
var loginComponent;
export default function Login() {
	const [user, setUser] = useState({});
	const [showLogin, setShowLogin] = useState(true);
	const onSuccess = (res) => {
		var userObject = jwt_decode(res.credential);
		setUser(userObject);
		setShowLogin(false);
	};

	useEffect(() => {
		// 👇️ Check if NOT undefined or null
		console.log(user);
		if (user != undefined) {
			div = (
				<div>
					<h3>Login Successfully</h3>
				</div>
			);
		}
	}, []);

	const onFailure = (res) => {
		console.log("[Login Failed]  res: ", res);
	};
	return (
		<div style={{ padding: "24% 48%" }}>
			{/* <GoogleLogin
				clientId={clientId}
				buttonText="Login"
				onSuccess={onSuccess}
				onFailure={onFailure}
				style={{ margin: "20px" }}
				isSignedIn={true}
				cookiePolicy="single_host_origin"
			/> */}
			{showLogin && (
				<GoogleLogin
					style={showLogin ? {} : { display: "none" }}
					onSuccess={onSuccess}
					onError={onFailure}
				/>
			)}
			{div}
		</div>
	);
}
