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
		interface API {
			neo4j: {
				system: PageData['system'];
				planets: PageData['planets'];
				stars: PageData['stars'];
				visibleSystems: PageData['visibleSystems'];
			};
		}
		interface PageData {
			system: AstroJson.Renderer.System;
			planets: AstroJson.Renderer.Planet[];
			stars: AstroJson.Renderer.Star[];
			visibleSystems: AstroJson.Renderer.VisibleSystemInSky[];
		}
		// interface PageState {}
		// interface Platform {}
	}
	export import AstroJSON = AstroJson;
}

export {};
