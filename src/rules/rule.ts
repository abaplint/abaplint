import File from "../file";

export interface Rule {
    get_key(): string;
    get_description(): string;
    run(file: File);
}