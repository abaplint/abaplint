import { Statement } from "./statement";
import { Token } from "../tokens/";

export class Endat extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^ENDAT/.test(str)) {
            return new Endat(tokens);
        }
        return undefined;
    }

}