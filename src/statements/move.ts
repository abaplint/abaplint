import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Move extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^(MOVE|MOVE-CORRESPONDING) /.test(str)
                || /^DATA\(\w+\) (\?)?= .*$/.test(str)
                || /^(\w|-|<|>|->|%|&|=>|~)+(\+\d+)?(\(\d+\))?(\[\])? (\?)?= .*$/.test(str)) {
            return new Move(tokens);
        }
        return undefined;
    }

}