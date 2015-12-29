import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Class extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CLASS /.test(str)) {
            return new Class(tokens);
        }
        return undefined;
    }

}