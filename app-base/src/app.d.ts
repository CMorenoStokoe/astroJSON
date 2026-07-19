import type { Session } from 'neo4j-driver';
import type { AstroJSON as AstroJson } from '../../types/AstroJSON';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			db: Session;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	export import AstroJSON = AstroJson;
}

export {};
