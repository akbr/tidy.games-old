export type EngineTypes = {
  states: { type: string; data?: any };
  actions: { type: string; data?: any };
  options: Record<string, any> | undefined;
};

type DefaultTypes = {
  states: never;
  actions: never;
  options: undefined;
};

export type CreateEngineTypes<
  UserTypes extends {
    states: EngineTypes["states"];
    actions: EngineTypes["actions"];
  } & Partial<EngineTypes>
> = {
  [Key in keyof EngineTypes]: UserTypes[Key] extends Object
    ? UserTypes[Key]
    : DefaultTypes[Key];
};

export type Ctx<ET extends EngineTypes> = {
  numPlayers: number;
  options: ET["options"];
};

export type GetInitialState<ET extends EngineTypes> = (
  Ctx: Ctx<ET>
) => ET["states"] | string;

export type AuthenticatedAction<ET extends EngineTypes> = ET["actions"] & {
  player: number;
  time: number;
};

export type Chart<ET extends EngineTypes> = {
  [State in ET["states"] as State["type"]]: (
    state: State,
    ctx: Ctx<ET>,
    action: AuthenticatedAction<ET> | null
  ) => ET["states"] | string | true | null;
};
