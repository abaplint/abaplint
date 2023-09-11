import {AbstractObject} from "./_abstract_object";

export class OutboundService extends AbstractObject {

  public getType(): string {
    return "SCO3";
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