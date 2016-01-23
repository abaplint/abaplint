import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Selectoption extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SELECT-OPTION(S)? /.test(str)) {
            return new Selectoption(tokens);
        }
        return undefined;
    }

}