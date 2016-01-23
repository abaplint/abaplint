import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endclass extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDCLASS/.test(str)) {
            return new Endclass(tokens);
        }
        return undefined;
    }

}