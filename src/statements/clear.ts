import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Clear extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CLEAR /.test(str)) {
            return new Clear(tokens);
        }
        return undefined;
    }

}