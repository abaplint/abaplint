import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Close extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^CLOSE /.test(str)) {
            return new Close(tokens);
        }
        return undefined;
    }

}