import { generateCode } from "../2fa/utils";
import { getQuery } from "../db/utils";
import { User } from "../types/types";

export async function getDisplayName(name: string): Promise<string> {
	let display_name: string = name.split(' ')[0];
	
	while (true) {
		const code = generateCode();
		display_name += code;
		const user = await getQuery<User>('SELECT * FROM users WHERE display_name = ?', [display_name]);
		
		if (!user) {
			return display_name;
		}
	}
}