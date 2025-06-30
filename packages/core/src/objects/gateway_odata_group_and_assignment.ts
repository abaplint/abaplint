import {AbstractObject} from "./_abstract_object";

export class GatewayODataGroupAndAssignment extends AbstractObject {

  public getType(): string {
    return "G4BA";
  }

  public getAllowedNaming() {
    return { // todo, verify
      maxLength: 32,
      allowNamespace: true,
    };
  }

  public getDescription(): string | undefined {
    // todo
    return undefined;
  }
}