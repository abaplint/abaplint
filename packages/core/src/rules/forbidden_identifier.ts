import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {TokenNodeRegex, TokenNode} from "../abap/nodes";
import {INode} from "../abap/nodes/_inode";
import {Token} from "../abap/1_lexer/tokens/_token";
import {IRuleMetadata} from "./_irule";

export class ForbiddenIdentifierConf extends BasicRuleConfig {
  /** List of forbideen identifiers, array of string regex */
  public check: string[] = [];
}

export class ForbiddenIdentifier extends ABAPRule {

  private conf = new ForbiddenIdentifierConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "forbidden_identifier",
      title: "Forbidden Identifier",
      shortDescription: `Forbid use of specified identifiers, list of regex.`,
      extendedInformation: `Used in the transpiler to find javascript keywords in ABAP identifiers,
https://github.com/abaplint/transpiler/blob/bda94b8b56e2b7f2f87be2168f12361aa530220e/packages/transpiler/src/validation.ts#L44`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ForbiddenIdentifierConf): void {
    this.conf = conf;
    if (this.conf.check === undefined) {
      this.conf.check = [];
    }
  }

  public runParsed(file: ABAPFile): Issue[] {
    if (this.conf.check.length === 0) {
      return [];
    }

    let ret: Issue[] = [];
    for (const s of file.getStatements()) {
      ret = ret.concat(this.traverse(s, file));
    }

    return ret;
  }

  private traverse(node: INode, file: ABAPFile): Issue[] {
    let ret: Issue[] = [];

    for (const c of node.getChildren()) {
      if (c instanceof TokenNodeRegex) {
        ret = ret.concat(this.check(c.get(), file));
      } else if (c instanceof TokenNode) {
        continue;
      } else {
        ret = ret.concat(this.traverse(c, file));
      }
    }

    return ret;
  }

  private check(token: Token, file: ABAPFile): Issue[] {
    const str = token.getStr();
    const ret: Issue[] = [];
    for (const c of this.conf.check) {
      const reg = new RegExp(c, "i");
      if (reg.exec(str)) {
        ret.push(Issue.atToken(file, token, "Identifer not allowed", this.getMetadata().key, this.conf.severity));
      }
    }
    return ret;
  }

}
