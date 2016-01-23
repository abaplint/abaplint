import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Split extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SPLIT /.test(str)) {
            return new Split(tokens);
        }
        return undefined;
    }

}