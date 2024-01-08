import { Horoscope, HoroscopeSign, Zodiac, ZodiacSign } from './datesign';

describe('Datesign Horoscope', () => {
  it('should be capricorn', () => {
    expect(HoroscopeSign(new Date('2024-01-01T00:00:00+0700'))).toBe(
      Horoscope.Capricornus,
    );
  });
  it('should be aqua', () => {
    expect(HoroscopeSign(new Date('2024-02-01T00:00:00+0700'))).toBe(
      Horoscope.Aquarius,
    );
  });
  it('should be pisces', () => {
    expect(HoroscopeSign(new Date('2024-03-01T00:00:00+0700'))).toBe(
      Horoscope.Pisces,
    );
  });
  it('should be aries', () => {
    expect(HoroscopeSign(new Date('2024-04-01T00:00:00+0700'))).toBe(
      Horoscope.Aries,
    );
  });
  it('should be taurus', () => {
    expect(HoroscopeSign(new Date('2024-05-01T00:00:00+0700'))).toBe(
      Horoscope.Taurus,
    );
  });
  it('should be gemini', () => {
    expect(HoroscopeSign(new Date('2024-06-01T00:00:00+0700'))).toBe(
      Horoscope.Gemini,
    );
  });
  it('should be cancer', () => {
    expect(HoroscopeSign(new Date('2024-07-01T00:00:00+0700'))).toBe(
      Horoscope.Cancer,
    );
  });
  it('should be leo', () => {
    expect(HoroscopeSign(new Date('2024-08-01T00:00:00+0700'))).toBe(
      Horoscope.Leo,
    );
  });
  it('should be virgo', () => {
    expect(HoroscopeSign(new Date('2024-09-01T00:00:00+0700'))).toBe(
      Horoscope.Virgo,
    );
  });
  it('should be libra', () => {
    expect(HoroscopeSign(new Date('2024-10-01T00:00:00+0700'))).toBe(
      Horoscope.Libra,
    );
  });
  it('should be scorpio', () => {
    expect(HoroscopeSign(new Date('2024-11-01T00:00:00+0700'))).toBe(
      Horoscope.Scorpius,
    );
  });
  it('should be sagita', () => {
    expect(HoroscopeSign(new Date('2024-12-01T00:00:00+0700'))).toBe(
      Horoscope.Sagittarius,
    );
  });
});

describe('Datesign Zoodiac', () => {
  it('should be rabbot', () => {
    expect(ZodiacSign(new Date('2024-01-01T00:00:00+0700'))).toBe(
      Zodiac.Rabbit,
    );
  });
  it('should be tiger', () => {
    expect(ZodiacSign(new Date('2022-02-01T00:00:00+0700'))).toBe(Zodiac.Tiger);
  });
  it('should be rat', () => {
    expect(ZodiacSign(new Date('2020-03-01T00:00:00+0700'))).toBe(Zodiac.Rat);
  });
  it('should be dog', () => {
    expect(ZodiacSign(new Date('2018-04-01T00:00:00+0700'))).toBe(Zodiac.Dog);
  });
  it('should be monkey', () => {
    expect(ZodiacSign(new Date('2016-05-01T00:00:00+0700'))).toBe(
      Zodiac.Monkey,
    );
  });
  it('should be horse', () => {
    expect(ZodiacSign(new Date('2014-06-01T00:00:00+0700'))).toBe(Zodiac.Horse);
  });
  it('should be dragon', () => {
    expect(ZodiacSign(new Date('2012-07-01T00:00:00+0700'))).toBe(
      Zodiac.Dragon,
    );
  });
  it('should be snake', () => {
    expect(ZodiacSign(new Date('2013-11-01T00:00:00+0700'))).toBe(Zodiac.Snake);
  });
  it('should be goat', () => {
    expect(ZodiacSign(new Date('2015-12-01T00:00:00+0700'))).toBe(Zodiac.Goat);
  });
  it('should be rooster', () => {
    expect(ZodiacSign(new Date('2017-12-01T00:00:00+0700'))).toBe(
      Zodiac.Rooster,
    );
  });
  it('should be pig', () => {
    expect(ZodiacSign(new Date('2019-12-01T00:00:00+0700'))).toBe(Zodiac.Pig);
  });
  it('should be ox', () => {
    expect(ZodiacSign(new Date('2021-12-01T00:00:00+0700'))).toBe(Zodiac.Ox);
  });
});
