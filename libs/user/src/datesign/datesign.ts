export enum Horoscope {
  Aries = 'Aries',
  Taurus = 'Taurus',
  Gemini = 'Gemini',
  Cancer = 'Cancer',
  Leo = 'Leo',
  Virgo = 'Virgo',
  Libra = 'Libra',
  Scorpius = 'Scorpius',
  Sagittarius = 'Sagittarius',
  Capricornus = 'Capricornus',
  Aquarius = 'Aquarius',
  Pisces = 'Pisces',
}

export enum Zodiac {
  Monkey = 'Monkey',
  Rooster = 'Rooster',
  Dog = 'Dog',
  Pig = 'Pig',
  Rat = 'Rat',
  Ox = 'Ox',
  Tiger = 'Tiger',
  Rabbit = 'Rabbit',
  Dragon = 'Dragon',
  Snake = 'Snake',
  Horse = 'Horse',
  Goat = 'Goat',
}

/* interface Date {
    horoscope: () => string;
    zodiac: () => string;
}

class DateSign implements IDateSign {
    constructor(date: Date) {}

    function horoscope(): string {
        return '';
    }
} */

/* Date.prototype['horoscope'] = function() {
    return '';
}

Date.prototype.zodiac = function(): string {
    return '';
} */

// ref: https://github.com/BesrourMS/ZodiacSigns/blob/main/index.js

export function HoroscopeSign(date: Date): string {
  return Object.values(Horoscope)[
    Number(
      new Intl.DateTimeFormat('fr-TN-u-ca-persian', {
        month: 'numeric',
      }).format(date),
    ) - 1
  ];
}

export function ZodiacSign(date: Date): string {
  const chineseDate = new Intl.DateTimeFormat('fr-TN-u-ca-chinese', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
    .format(date)
    .substring(0, 4);

  return Object.values(Zodiac)[+chineseDate % 12];
}
