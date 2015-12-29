import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Move extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(MOVE|MOVE-CORRESPONDING) /.test(str)) {
            return new Move(tokens);
        }
        return undefined;
    }

}