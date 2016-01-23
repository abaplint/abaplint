import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endwhile extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDWHILE/.test(str)) {
            return new Endwhile(tokens);
        }
        return undefined;
    }

}