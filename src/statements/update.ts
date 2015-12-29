import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Update extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^UPDATE /.test(str)) {
            return new Update(tokens);
        }
        return undefined;
    }

}