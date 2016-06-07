import { Statement } from "./statement";
import { Token } from "../tokens/";

export class InterfaceDef extends Statement {

    public static match(tokens: Array<Token>): Statement {
        let str = Statement.concat(tokens).toUpperCase();
        if (/^INTERFACES? /.test(str)) {
            return new InterfaceDef(tokens);
        }
        return undefined;
    }

}