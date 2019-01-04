import {FunctionModuleParameters} from "./function_module_parameters";

export class FunctionModuleDefinition {
  private name: string;
  private parameters: FunctionModuleParameters;

  constructor(data: any) {
    this.name = data.FUNCNAME._text;
// todo, parse parameters
  }

  public getParameters() {
    return this.parameters;
  }

  public getName(): string {
    return this.name;
  }

}