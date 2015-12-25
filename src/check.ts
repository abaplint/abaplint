import Parser from "./parser";

interface Check {
    get_key(): string;
    get_description(): string;
    run(filename: string, parser: Parser);
}

export default Check;