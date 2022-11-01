import {AbstractObject} from "./_abstract_object";

export class InboundService extends AbstractObject {

  public getType(): string {
    return "SCO2";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 200,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}