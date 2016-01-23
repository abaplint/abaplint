import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Loop extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^LOOP /.test(str)) {
            return new Loop(tokens);
        }
        return undefined;
    }

}