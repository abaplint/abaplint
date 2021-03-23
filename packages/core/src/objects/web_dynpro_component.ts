import {AbstractObject} from "./_abstract_object";

export class WebDynproComponent extends AbstractObject {

  public getType(): string {
    return "WDYN";
  }

  public getAllowedNaming() {
    return {
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}
