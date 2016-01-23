import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Submit extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SUBMIT /.test(str)) {
            return new Submit(tokens);
        }
        return undefined;
    }

}