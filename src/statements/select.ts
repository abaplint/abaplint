import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Select extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^SELECT /.test(str)) {
            return new Select(tokens);
        }
        return undefined;
    }

}