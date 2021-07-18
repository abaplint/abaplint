import {Combi} from "../abap/2_statements/combi";
import {ExpressionNode} from "../abap/nodes";
import {IFile} from "../files/_ifile";
import {defaultVersion} from "../version";
import {DDLLexer} from "./ddl_lexer";
import {DDLStructureField} from "./expressions/ddl_structure_field";
import {DDLName} from "./expressions/ddl_name";
import {DDLStructure} from "./expressions/ddl_structure";
import {DDLTable} from "./expressions/ddl_table";
import {DDLType} from "./expressions/ddl_type";
import {DDLTableField} from "./expressions/ddl_table_field";

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

    let res = Combi.run(new DDLStructure(), tokens, defaultVersion);
    if (res === undefined) {
      res = Combi.run(new DDLTable(), tokens, defaultVersion);
    }
    if (res === undefined || !(res[0] instanceof ExpressionNode)) {
      return undefined;
    }
    return this.parsedToResult(res[0]);
  }

  private parsedToResult(node: ExpressionNode): IDDLParserResult {
    const fields: IDDLParserResultField[] = [];
    for (const f of node.findDirectExpressions(DDLStructureField).concat(node.findDirectExpressions(DDLTableField))) {
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
      kind: node.get() instanceof DDLStructure ? DDLKind.Structure : DDLKind.Table,
      fields,
    };

    return result;
  }
}