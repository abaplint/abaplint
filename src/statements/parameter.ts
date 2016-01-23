import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Parameter extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^PARAMETER(S?) /.test(str)) {
            return new Parameter(tokens);
        }
        return undefined;
    }

}