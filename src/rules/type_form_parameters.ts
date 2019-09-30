import {Issue} from "../issue";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Registry} from "../registry";
import * as Expressions from "../abap/expressions";
import {ABAPObject} from "../objects/_abap_object";

/** Checks for untyped FORM parameters */
export class TypeFormParametersConf extends BasicRuleConfig {
}

export class TypeFormParameters extends ABAPRule {

  private conf = new TypeFormParametersConf();

  public getKey(): string {
    return "type_form_parameters";
  }

  public getDescription(parameterName: string): string {
    return "Add TYPE for FORM parameter" + parameterName;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: TypeFormParametersConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: ABAPObject) {
    const ret: Issue[] = [];

    const stru = file.getStructure();
    if (obj instanceof Class || stru === undefined) {
      return ret;
    }

    for (const formparam of stru.findAllExpressions(Expressions.FormParam)) {
      if (formparam.findFirstExpression(Expressions.FormParamType) === undefined) {
        const token = formparam.getFirstToken();
        ret.push(new Issue({
          file,
          message: this.getDescription(token.getStr()),
          key: this.getKey(),
          start: token.getStart(),
          end: token.getEnd(),
        }));
      }
    }

    return ret;
  }

}
