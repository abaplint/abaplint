import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Write extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^WRITE /.test(str)) {
            return new Write(tokens);
        }
        return undefined;
    }

}