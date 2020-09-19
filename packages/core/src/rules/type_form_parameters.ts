import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Expressions from "../abap/2_statements/expressions";
import {ABAPObject} from "../objects/_abap_object";
import {IRuleMetadata} from "./_irule";

export class TypeFormParametersConf extends BasicRuleConfig {
}

export class TypeFormParameters extends ABAPRule {

  private conf = new TypeFormParametersConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "type_form_parameters",
      title: "Type FORM parameters",
      shortDescription: `Checks for untyped FORM parameters`,
      badExample: `FORM foo USING bar.`,
      goodExample: `FORM foo USING bar TYPE string.`,
    };
  }

  private getDescription(parameterName: string): string {
    return "Add TYPE for FORM parameter \"" + parameterName + "\"";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TypeFormParametersConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, obj: ABAPObject) {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (obj instanceof Class || stru === undefined) {
      return ret;
    }

    for (const formparam of stru.findAllExpressions(Expressions.FormParam)) {
      if (formparam.findFirstExpression(Expressions.FormParamType) === undefined) {
        const token = formparam.getFirstToken();
        const issue = Issue.atToken(file, token, this.getDescription(token.getStr()), this.getMetadata().key, this.conf.severity);
        ret.push(issue);
      }
    }

    return ret;
  }

}
