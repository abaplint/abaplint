import { Statement } from "./statement";
import { Token } from "../tokens/tokens";

export class Endcase extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDCASE/.test(str)) {
            return new Endcase(tokens);
        }
        return undefined;
    }

}