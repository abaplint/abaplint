import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultVersion} from "../version";
import {DDLLexer} from "./ddl_lexer";
import * as Expressions from "../abap/2_statements/expressions";

export enum DDLKind {
  Structure = "structure",
  Table = "table",
}

export interface IDDLParserResultField {
  key: boolean,
  name: string,
  type: string,
  notNull: boolean,
}

export interface IDDLParserResult {
  name: string,
  kind: DDLKind,
  fields: IDDLParserResultField[];
}

export class DDLParser {
  public parse(file: IFile): IDDLParserResult | undefined {
    const tokens = DDLLexer.run(file);

    let res = Combi.run(new Expressions.DDLStructure(), tokens, defaultVersion);
    if (res === undefined) {
      res = Combi.run(new Expressions.DDLTable(), tokens, defaultVersion);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return this.parsedToResult(res[0]);
  }

  private parsedToResult(node: ExpressionNode): IDDLParserResult {
    const fields: IDDLParserResultField[] = [];
    let found = node.findDirectExpressions(Expressions.DDLStructureField);
    found = found.concat(node.findDirectExpressions(Expressions.DDLTableField));
    found = found.concat(node.findDirectExpressions(Expressions.DDLInclude));
    for (const f of found) {
      const name = f.findDirectExpression(Expressions.DDLName)?.concatTokens() || "";
      if (f.get() instanceof Expressions.DDLInclude) {
        fields.push({
          name: ".INCLUDE",
          type: name,
          key: false,
          notNull: false,
        });
      } else {
        const type = f.findDirectExpression(Expressions.DDLType)?.concatTokens() || "";
        fields.push({
          name,
          type,
          key: false,
          notNull: false,
        });
      }
    }

    const result: IDDLParserResult = {
      name: node.findDirectExpression(Expressions.DDLName)!.concatTokens(),
      kind: node.get() instanceof Expressions.DDLStructure ? DDLKind.Structure : DDLKind.Table,
      fields,
    };

    return result;
  }
}