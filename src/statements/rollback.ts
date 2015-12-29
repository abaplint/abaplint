import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Rollback extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ROLLBACK WORK/.test(str)) {
            return new Rollback(tokens);
        }
        return undefined;
    }

}