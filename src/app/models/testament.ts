import { Uuidable } from "./sluggable";

export class Testament implements Uuidable {
    id!: string;
    uuid!: string;
    name!: string;
    created_at!: string;
    updated_at!: string;
}