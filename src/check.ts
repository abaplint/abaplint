import Statement from "./statement";

interface Check {
    get_key(): string;
    get_description(): string;
    run(statements: Array<Statement>);
}

export default Check;