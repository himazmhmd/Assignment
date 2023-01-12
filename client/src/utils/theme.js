import { createTheme, responsiveFontSizes } from "@mui/material";

const theme = responsiveFontSizes(
	createTheme({
		palette: {
			primary: {
				main: "#37474f",
				dark: "#455a64",
				light: "#263238",
			},
			//secondary: {},
		},
	})
);

export default theme;
