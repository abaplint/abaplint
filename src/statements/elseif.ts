import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Elseif extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ELSEIF /.test(str)) {
            return new Elseif(tokens);
        }
        return undefined;
    }

}