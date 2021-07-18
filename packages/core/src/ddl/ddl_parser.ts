import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultVersion} from "../version";
import {DDLLexer} from "./ddl_lexer";
import {DDLField} from "./expressions/field";
import {DDLName} from "./expressions/name";
import {Structure} from "./expressions/structure";
import {DDLType} from "./expressions/type";

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

    const res = Combi.run(new Structure(), tokens, defaultVersion);
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return this.parsedToResult(res[0]);
  }

  private parsedToResult(node: ExpressionNode): IDDLParserResult {
    const fields: IDDLParserResultField[] = [];
    for (const f of node.findDirectExpressions(DDLField)) {
      const name = f.findDirectExpression(DDLName)?.concatTokens() || "";
      const type = f.findDirectExpression(DDLType)?.concatTokens() || "";
      fields.push({
        name,
        type,
        key: false,
        notNull: false,
      });
    }

    const result: IDDLParserResult = {
      name: node.findDirectExpression(DDLName)!.concatTokens(),
      kind: DDLKind.Structure,
      fields,
    };

    return result;
  }
}