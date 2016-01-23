import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Convert extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CONVERT /.test(str)) {
            return new Convert(tokens);
        }
        return undefined;
    }

}