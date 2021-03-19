import {AbstractObject} from "./_abstract_object";

export class WebDynproApplicationConfiguration extends AbstractObject {

  public getType(): string {
    return "WDCA";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 30,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}