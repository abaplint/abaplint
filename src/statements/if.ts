import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class If extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^IF /.test(str)) {
            return new If(tokens);
        }
        return undefined;
    }

}