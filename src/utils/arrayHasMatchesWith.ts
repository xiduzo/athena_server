export const arrayHasMatchesWith = (arrayOne: string[], arrayTwo: string[]) => {
  return arrayOne.some((scope: any) => arrayTwo.indexOf(scope) !== -1)
}
