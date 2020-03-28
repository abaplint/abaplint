import {Issue} from "../../issue";
import {ABAPRule} from "./../_abap_rule";
import {ABAPFile} from "../../files";
import {BasicRuleConfig} from "../_basic_rule_config";
import {CallTransformation} from "../../abap/2_statements/statements";
import {NamespaceSimpleName} from "../../abap/2_statements/expressions";
import {IRegistry} from "../../_iregistry";

/** Checks that used XSLT transformations exist. */
export class CheckTransformationExistsConf extends BasicRuleConfig {
}

export class CheckTransformationExists extends ABAPRule {
  private conf = new CheckTransformationExistsConf();

  public getKey(): string {
    return "check_transformation_exists";
  }

  private getDescription(name: string): string {
    return "Transformation \"" + name + "\" not found";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckTransformationExistsConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: IRegistry) {
    const output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof CallTransformation) {
        const name = s.findFirstExpression(NamespaceSimpleName);
        if (name === undefined) {
          continue;
        }
        const tok = name.getFirstToken();
        if (reg.getObject("XSLT", tok.getStr()) === undefined) {
          const issue = Issue.atToken(file, tok, this.getDescription(tok.getStr()), this.getKey());
          output.push(issue);
        }
      }
    }

    return output;
  }

}
