import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Condense extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CONDENSE /.test(str)) {
            return new Condense(tokens);
        }
        return undefined;
    }

}