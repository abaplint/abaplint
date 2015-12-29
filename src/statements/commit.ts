import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Commit extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^COMMIT WORK/.test(str)) {
            return new Commit(tokens);
        }
        return undefined;
    }

}