import { Sluggable } from "./sluggable";

export class Testament implements Sluggable {
    id!: string;
    name!: string;
    slug!: string;
    created_at!: string;
    updated_at!: string;
}