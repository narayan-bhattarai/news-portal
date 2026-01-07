declare module 'nepali-date-converter' {
    export default class NepaliDate {
        constructor(date?: Date | string | number);
        getDate(): number;
        getMonth(): number;
        getYear(): number;
        getDay(): number;
        format(formatStr: string): string;
    }
}
