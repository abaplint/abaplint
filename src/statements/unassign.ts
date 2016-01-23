import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Unassign extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^UNASSIGN /.test(str)) {
            return new Unassign(tokens);
        }
        return undefined;
    }

}