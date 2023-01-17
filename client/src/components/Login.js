import { React, useState, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GoogleLogin } from "@react-oauth/google";
import jwt_decode from "jwt-decode";
import axios from "axios";

const theme = createTheme();

const allowedExtensions = ["csv"];

const clientId =
	"199690433841-kgotjmmnmq06lfvso433pm39chpdt1a1.apps.googleusercontent.com";
var div;
var loginComponent;

const useStyles = createTheme((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
}));

export default function Login() {
	// Login
	const [user, setUser] = useState();
	const [savedCsv, setSavedCsv] = useState();
	const [showLogin, setShowLogin] = useState(true);
	const [loggedIn, setLoggedIn] = useState(false);
	const onSuccess = (res) => {
		var userObject = jwt_decode(res.credential);
		setUser(userObject);
		console.log(userObject);
		axios
			.post("http://localhost:5000/register", {
				email: userObject.email,
			})
			.then((response) => {
				setLoggedIn(true);
				alert("Logged In Succefully");
			})
			.catch((error) => {
				setLoggedIn(true);
				console.log("Login Failed");
			});

		setShowLogin(false);
	};
	const onFailure = (res) => {
		console.log("[Login Failed]  res: ", res);
	};

	useEffect(() => {
		// 👇️ Check if NOT undefined or null

		if (loggedIn) {
			const email = user.email;
			axios
				.get("http://localhost:5000/fetch-csv-data", {
					params: {
						email: email,
					},
				})
				.then((response) => {
					console.log(response.data);
					console.log(response);
					setSavedCsv(response.data);
				})
				.catch((error) => {
					console.log(error);
				});
		}
	}, [loggedIn]);

	// csv file uploads and reading
	const [csvData, setCsvData] = useState([]);
	const [error, setError] = useState("");
	const [csvFile, setCsvFile] = useState("");

	//Drag and drop csv

	const [file, setFile] = useState(null);
	const [fileData, setFileData] = useState(null);
	const [message, setMessage] = useState(
		"Drag and drop a CSV file here, or click to upload"
	);

	const handleDrop = (e) => {
		e.preventDefault();
		const files = e.dataTransfer.files;
		if (files.length === 1 && files[0].type === "text/csv") {
			setFile(files[0]);
			setMessage(`File ${files[0].name} has been uploaded`);
		}
	};

	const handleClick = (e) => {
		e.preventDefault();
		const input = document.createElement("input");
		input.type = "file";
		input.accept = ".csv";
		input.onchange = (e) => {
			setFile(input.files[0]);
			setMessage(`File ${input.files[0].name} has been uploaded`);
		};
		input.click();
	};

	const handleUpload = async (e) => {
		e.preventDefault();
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.onload = (e) => {
			const contents = e.target.result;
			const rows = contents.split("\n").filter((row) => row.length);
			const headers = rows[0].split(",");
			setFileData({ headers, rows });
		};
		reader.readAsText(file);
	};

	const handleSave = async (e) => {
		e.preventDefault();
		if (!file) {
			return;
		}
		console.log(user);
		if (!user || user == undefined) {
			alert("Please Login to save the file");
		} else {
			const formData = new FormData();
			formData.append("file", file);
			formData.append("email", user.email);

			axios
				.post("http://localhost:5000/upload", formData)
				.then((response) => {
					alert("File saved successfully");
				})
				.catch((error) => {
					alert("failed to save the file");
				});
		}
	};

	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<div>
				<div
					className="row"
					style={{ borderBottom: "1px solid black", paddingBottom: "20px" }}
				>
					<div className="col-10"></div>
					<div
						className="col-2 justify-content-end"
						style={{
							paddingTop: "20px",
						}}
					>
						{showLogin && (
							<GoogleLogin onSuccess={onSuccess} onError={onFailure} />
						)}
						{loggedIn && (
							<div className="row">
								<div className="col-4">
									<img
										src={user.picture}
										style={{
											borderRadius: "50%",
											height: "50px",
											width: "50px",
										}}
									/>
								</div>
								<div className="col-8" style={{ padding: "5px" }}>
									<div className="row">
										{user.given_name} {user.family_name}
									</div>
									<div className="row">
										<span style={{ fontSize: "10px" }}>{user.email}</span>
									</div>
								</div>
							</div>
						)}
					</div>
				</div>
				<div className="container" style={{ padding: "30px" }}>
					<div className="row">
						<div className="col-4"></div>
						<div
							className="col-4"
							style={{ alignItems: "right", textAlign: "right" }}
						>
							<div>
								<div
									style={{
										width: "100%",
										height: "200px",
										borderRadius: "5px",
										border: "1px dashed black",
										textAlign: "center",
										paddingTop: "20%",
									}}
									onClick={handleClick}
									onDrop={handleDrop}
									onDragOver={(e) => e.preventDefault()}
								>
									{message}
								</div>
								<button
									onClick={handleSave}
									style={{
										marginTop: "20px",
										marginBottom: "20px",
										marginRight: "10px",
										borderRadius: "5px",
									}}
								>
									Save
								</button>
								<button
									onClick={handleUpload}
									style={{
										marginTop: "20px",
										marginBottom: "20px",
										borderRadius: "5px",
									}}
								>
									Upload
								</button>
							</div>
						</div>
						<div className="col-4"></div>
					</div>
					<div className="row">
						{fileData && (
							<table style={{ marginBottom: "50px" }}>
								<thead>
									<tr>
										{fileData.headers.map((header, index) => (
											<th
												key={index}
												style={{
													border: "1px black solid",
													textAlign: "center",
												}}
											>
												{header}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{fileData.rows.map((row, index) => (
										<tr key={index}>
											{row.split(",").map((cell, index) => (
												<td
													key={index}
													style={{
														border: "1px black solid",
														textAlign: "center",
													}}
												>
													{cell}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						)}
					</div>

					{savedCsv && (
						<div
							style={{
								alignItems: "center",
								justifyContent: "center",
								alignContents: "center",
							}}
						>
							<h1 style={{ textAlign: "center" }}>Saved Files</h1>
							<ul style={{ listStyleType: "none" }}>
								{savedCsv.map((csv) => (
									<li className="justify-content-center" key={csv._id}>
										<h5 style={{ margin: "10px", textAlign: "center" }}>
											{csv.fileName}
										</h5>
										<table
											className="center-table"
											style={{ margin: "0 auto" }}
										>
											<thead>
												<tr
													style={{
														textAlign: "center",
														alignItems: "center",
														alignContent: "center",
														border: "solid 1px black",
													}}
												>
													{Object.keys(csv.data[0]).map((key) => (
														<th
															key={key}
															style={{
																textAlign: "center",
																alignItems: "center",
																alignContent: "center",
																border: "solid 1px black",
																padding: "10px",
															}}
														>
															{key}
														</th>
													))}
												</tr>
											</thead>
											<tbody>
												{csv.data.map((row, index) => (
													<tr>
														{Object.values(row).map((cell, i) => (
															<td
																key={i}
																style={{
																	textAlign: "center",
																	alignItems: "center",
																	alignContent: "center",
																	border: "solid 1px black",
																	padding: "10px",
																}}
															>
																{cell}
															</td>
														))}
													</tr>
												))}
											</tbody>
										</table>
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			</div>
		</ThemeProvider>
	);
}
