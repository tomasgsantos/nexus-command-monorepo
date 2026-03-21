import { useState } from "react";
import styles from "./Login.module.css";
import { buildClassName } from "../../utils/misc";

const initialFields = {
	username: "",
	password: "",
};


const Login = () => {
	const [fields, setFields] = useState<typeof initialFields>(initialFields);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFields({
			...fields,
			[name]: value,
		});
	};

	const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		console.log(fields);
	};

	return (
		<div className={styles.loginScreen}>
			<form className={styles.loginForm} onSubmit={handleFormSubmit}>
				<header className={styles.header}>
					<h1>Login</h1>
				</header>
				<section className={styles.inputSection}>
					<span
						className={buildClassName(["inputGroup", "usernameWrap"], styles)}
					>
						<label htmlFor="username">Username</label>
						<input
							type="text"
							value={fields.username}
							name="username"
							onChange={handleInputChange}
						/>
					</span>
					{fields.username && (
						<span
							className={buildClassName(["inputGroup", "passwordWrap"], styles)}
						>
							<label htmlFor="password">Password</label>
							<input
								type="password"
								value={fields.password}
								name="password"
								onChange={handleInputChange}
							/>
						</span>
					)}
				</section>
				<footer className={styles.footer}>
					<button type="submit">Submit</button>
				</footer>
			</form>
		</div>
	);
};

export default Login;
