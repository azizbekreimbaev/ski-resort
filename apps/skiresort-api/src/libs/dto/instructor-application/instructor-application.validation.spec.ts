import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import {
  InstructorApplicationInput,
  InstructorApplicationReject,
  InstructorApplicationsInquiry,
} from './instructor-application.input';
import { InstructorProfileUpdate } from '../member/instructor-profile.update';
import { InstructorAudience, InstructorLevel } from '../../enums/member.enum';

const valid = {
  instructorExperienceYears: 0,
  instructorLanguages: [' English '],
  instructorLevel: InstructorLevel.ALL,
  instructorAudience: InstructorAudience.KIDS,
};

describe('Instructor application and profile validation', () => {
  it('trims languages and accepts zero experience and optional null association', () => {
    const input = plainToInstance(InstructorApplicationInput, {
      ...valid,
      instructorResortId: null,
    });
    expect(validateSync(input)).toEqual([]);
    expect(input.instructorLanguages).toEqual(['English']);
  });

  it.each([
    ['instructorExperienceYears', -1],
    ['instructorExperienceYears', 1.5],
    ['instructorExperienceYears', null],
    ['instructorLanguages', []],
    ['instructorLanguages', [' ']],
    ['instructorLanguages', [12]],
    ['instructorLanguages', null],
    ['instructorLevel', 'MIXED'],
    ['instructorLevel', null],
    ['instructorAudience', 'UNKNOWN'],
    ['instructorAudience', null],
    ['instructorResortId', 'bad-id'],
  ])('rejects invalid application %s = %j', (field, value) => {
    expect(
      validateSync(
        plainToInstance(InstructorApplicationInput, {
          ...valid,
          [field]: value,
        }),
      ).some((error) => error.property === field),
    ).toBe(true);
  });

  it.each(Object.values(InstructorAudience))(
    'accepts audience %s',
    (audience) => {
      expect(
        validateSync(
          plainToInstance(InstructorApplicationInput, {
            ...valid,
            instructorAudience: audience,
          }),
        ),
      ).toEqual([]);
    },
  );

  it('validates nested application filters and bounds', () => {
    expect(
      validateSync(
        plainToInstance(InstructorApplicationsInquiry, {
          page: 1,
          limit: 101,
          search: { memberId: 'invalid', applicationStatus: 'INVALID' },
        }),
      ).map((error) => error.property),
    ).toEqual(expect.arrayContaining(['limit', 'search']));
  });

  it('requires a trimmed nonblank rejection reason', () => {
    expect(
      validateSync(
        plainToInstance(InstructorApplicationReject, {
          _id: 'a'.repeat(24),
          rejectionReason: ' ',
        }),
      ).some((error) => error.property === 'rejectionReason'),
    ).toBe(true);
  });

  it('allows clearing nullable profile fields and omitting others', () => {
    expect(
      validateSync(
        plainToInstance(InstructorProfileUpdate, {
          instructorAudience: null,
          instructorLanguages: null,
          instructorPrice1Week: null,
          instructorResortId: null,
        }),
      ),
    ).toEqual([]);
    expect(validateSync(new InstructorProfileUpdate())).toEqual([]);
  });

  it.each([
    'instructorPrice1Week',
    'instructorPrice2Weeks',
    'instructorPrice3Weeks',
    'instructorPrice4Weeks',
  ])('validates finite nonnegative %s', (field) => {
    for (const value of [-1, NaN, Infinity]) {
      expect(
        validateSync(
          plainToInstance(InstructorProfileUpdate, { [field]: value }),
        ).some((error) => error.property === field),
      ).toBe(true);
    }
    expect(
      validateSync(plainToInstance(InstructorProfileUpdate, { [field]: 1.25 })),
    ).toEqual([]);
  });
});
