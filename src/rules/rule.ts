import File from "../file";

export interface Rule {
    get_key(): string;
    get_description(): string;
    default_config();
    run(file: File);
}