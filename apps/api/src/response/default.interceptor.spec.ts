import { DefaultResponseInterceptor } from './default.interceptor';
import { of } from 'rxjs';

describe('DefaultResponseInterceptor', () => {
  const interceptor = new DefaultResponseInterceptor();
  const responsePipe = (data, nextCallback: (arg0: any) => any) => {
    const obs = interceptor.intercept({} as any, {
      handle: () => of(data),
    });

    obs.subscribe({
      next: nextCallback,
    });
  };
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    it('empty object', () => {
      responsePipe({}, (v) =>
        expect(v).toEqual({
          data: {},
          message: 'success',
        }),
      );
    });

    it('empty array', () => {
      responsePipe([], (v) =>
        expect(v).toEqual({
          data: [],
          message: 'success',
        }),
      );
    });

    it('data exist', () => {
      responsePipe(
        {
          data: 'exist',
        },
        (v) =>
          expect(v).toEqual({
            message: 'success',
            data: 'exist',
          }),
      );
    });

    it('data array exist', () => {
      responsePipe(['a', 'b', 'c'], (v) =>
        expect(v).toEqual({
          message: 'success',
          data: ['a', 'b', 'c'],
        }),
      );
    });
  });
});
