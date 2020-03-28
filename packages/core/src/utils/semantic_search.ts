import {Artifacts} from "../abap/artifacts";
import {ExpressionNode} from "../abap/nodes";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IRegistry} from "../_iregistry";
import {ABAPFile} from "../abap/abap_file";
import {ABAPObject} from "../objects/_abap_object";

function getABAPObjects(reg: IRegistry): ABAPObject[] {
  return reg.getObjects().filter((obj) => { return obj instanceof ABAPObject; }) as ABAPObject[];
}

export interface ICode {
  code: string;
  file: number;
  row: number;
}

export interface IResult {
  key: string;
  found: ICode[];
}

export interface ISemanticSearchResult {
  expressions: IResult[];
  files: string[];
}

export class SemanticSearch {
  private readonly reg: IRegistry;

  public constructor(reg: IRegistry) {
    this.reg = reg;
  }

  private findFiles(): ABAPFile[] {
    const ret: ABAPFile[] = [];
    const obj = getABAPObjects(this.reg);
    for (const o of obj) {
      for (const file of o.getABAPFiles()) {
        ret.push(file);
      }
    }
    return ret;
  }

  public run(): ISemanticSearchResult {
    const result: ISemanticSearchResult = {expressions: [], files: []};

    this.reg.parse();

    const files = this.findFiles();
    for (const file of files) {
      result.files.push(file.getFilename());
    }

    for (const expr of Artifacts.getExpressions()) {
      const found: ICode[] = [];

      for (let file = 0; file < files.length; file++) {
        const structure = files[file].getStructure();
        if (structure === undefined) {
          continue;
        }

        for (const f of structure.findAllExpressions(expr)) {
          found.push({
            code: this.buildCode(f),
            file,
            row: f.getFirstToken().getRow(),
          });
        }
      }

      result.expressions.push({key: new expr().constructor.name, found});
    }

    return result;
  }

  private buildCode(node: ExpressionNode): string {
    let prev: Token | undefined = undefined;
    let ret = "";

    for (const t of node.getAllTokens()) {
      if (prev && prev.getRow() !== t.getRow()) {
        ret = ret + " ";
      } else if (prev && prev.getEnd().getCol() < t.getStart().getCol()) {
        ret = ret + " ";
      }
      ret = ret + t.getStr();
      prev = t;
    }

    return ret.trim();
  }

}