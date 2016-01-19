import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Free extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^FREE /.test(str)) {
            return new Free(tokens);
        }
        return undefined;
    }

}