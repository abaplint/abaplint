import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Exit extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^EXIT/.test(str)) {
            return new Exit(tokens);
        }
        return undefined;
    }

}