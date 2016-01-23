import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Leave extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^LEAVE /.test(str)) {
            return new Leave(tokens);
        }
        return undefined;
    }

}