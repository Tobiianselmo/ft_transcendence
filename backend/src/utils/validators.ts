 

 
 
 
 
export function isStrongerPassword(password: string): boolean {
	const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
	return strongPasswordRegex.test(password);
}

 
export function isValidEmail(email: string): boolean {
	const validEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return validEmailRegex.test(email);
}

 
export function isValidDisplayName(name: string): boolean {
	const validDisplayName = /^[a-zA-Z0-9_]{3,}$/;
	return validDisplayName.test(name);
}