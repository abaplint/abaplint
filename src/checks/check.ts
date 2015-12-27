import File from "../file";

export interface Check {
    get_key(): string;
    get_description(): string;
    run(file: File);
}