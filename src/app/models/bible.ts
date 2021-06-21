import { Sluggable } from "./sluggable";

export class Bible implements Sluggable{

	id!: number;
	name!: string;
	abbreviation!: string;
	slug!: string;
	created_at!: string;
	updated_at!: string;

}
