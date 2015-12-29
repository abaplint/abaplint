import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Modify extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^MODIFY /.test(str)) {
            return new Modify(tokens);
        }
        return undefined;
    }

}