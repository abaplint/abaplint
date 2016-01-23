import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Enddo extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDDO/.test(str)) {
            return new Enddo(tokens);
        }
        return undefined;
    }

}