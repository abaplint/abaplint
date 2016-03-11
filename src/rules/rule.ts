import File from "../file";

export interface Rule {
    get_key(): string;
    get_description(): string;
    get_config();
    set_config(conf);
    run(file: File);
}