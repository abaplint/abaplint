import File from "../file";

export interface Rule {
// todo, rename methods, no underscore
    get_key(): string;
    get_description(): string;
    get_config();
    set_config(conf);
    run(file: File);
}