import Parser from "../parser";

export interface Check {
    get_key(): string;
    get_description(): string;
    run(filename: string, parser: Parser);
}

//export Check;