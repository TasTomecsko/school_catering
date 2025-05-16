export interface StructuredMealInfo {
    [date: string]: {id: number, code: string, description: string, allergyWarnings: string[]}[]
}