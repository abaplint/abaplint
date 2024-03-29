import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {CallTransformation} from "../abap/2_statements/statements";
import {NamespaceSimpleName} from "../abap/2_statements/expressions";
import {RuleTag} from "./_irule";
import {ABAPFile} from "../abap/abap_file";

export class CheckTransformationExistsConf extends BasicRuleConfig {
}

export class CheckTransformationExists extends ABAPRule {
  private conf = new CheckTransformationExistsConf();

  public getMetadata() {
    return {
      key: "check_transformation_exists",
      title: "Check transformation exists",
      shortDescription: `Checks that used XSLT transformations exist.`,
      tags: [RuleTag.Syntax],
    };
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

  public runParsed(file: ABAPFile) {
    const output: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const s of file.getStatements()) {
      if (s.get() instanceof CallTransformation) {
        const nameExpression = s.findFirstExpression(NamespaceSimpleName);
        if (nameExpression === undefined) {
          continue;
        }
        const tok = nameExpression.getFirstToken();
        const name = tok.getStr();
        if (this.reg.inErrorNamespace(name) === true
            && this.reg.getObject("XSLT", name) === undefined) {
          const issue = Issue.atToken(file, tok, this.getDescription(name), this.getMetadata().key);
          output.push(issue);
        }
      }
    }

    return output;
  }

}
