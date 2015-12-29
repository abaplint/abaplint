import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Form extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^FORM /.test(str)) {
            return new Form(tokens);
        }
        return undefined;
    }

}