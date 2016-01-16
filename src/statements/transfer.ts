import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Transfer extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^TRANSFER /.test(str)) {
            return new Transfer(tokens);
        }
        return undefined;
    }

}