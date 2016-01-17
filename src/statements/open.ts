import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Open extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^OPEN /.test(str)) {
            return new Open(tokens);
        }
        return undefined;
    }

}