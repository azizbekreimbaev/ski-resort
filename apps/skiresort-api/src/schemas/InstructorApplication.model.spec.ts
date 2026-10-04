import { model, Types } from 'mongoose';
import InstructorApplicationSchema from './InstructorApplication.model';
import MemberSchema from './Member.model';
import {
  InstructorAudience,
  InstructorLevel,
  MemberType,
} from '../libs/enums/member.enum';
import { InstructorApplicationStatus } from '../libs/enums/instructor-application.enum';

const ApplicationModel = model(
  'InstructorApplicationSchemaTest',
  InstructorApplicationSchema,
);
const MemberModel = model('InstructorMemberSchemaTest', MemberSchema);
const valid = {
  memberId: new Types.ObjectId(),
  instructorExperienceYears: 2,
  instructorLanguages: ['English'],
  instructorLevel: InstructorLevel.ALL,
  instructorAudience: InstructorAudience.FAMILY,
};

describe('Instructor persistence contracts', () => {
  it('uses the exact three target Member roles', () => {
    expect(Object.values(MemberType).sort()).toEqual([
      'ADMIN',
      'INSTRUCTOR',
      'USER',
    ]);
    expect((MemberType as Record<string, string>).AGENT).toBeUndefined();
  });

  it('keeps members collection and existing USER defaults while leaving instructor fields null', () => {
    const member = new MemberModel({
      memberNick: 'user',
      memberPhone: 'phone',
      memberPassword: 'hash',
    });
    expect(member.validateSync()).toBeUndefined();
    expect(MemberSchema.get('collection')).toBe('members');
    expect(member.memberType).toBe(MemberType.USER);
    for (const field of [
      'instructorResortId',
      'instructorExperienceYears',
      'instructorLanguages',
      'instructorLevel',
      'instructorAudience',
      'instructorPrice1Week',
      'instructorPrice2Weeks',
      'instructorPrice3Weeks',
      'instructorPrice4Weeks',
    ]) {
      expect(member.get(field)).toBeNull();
    }
    expect(MemberSchema.path('instructorAudience')).toBeDefined();
    expect(MemberSchema.path('instructoAudience')).toBeUndefined();
  });

  it('defaults applications to PENDING with nullable review fields and exact references', () => {
    const application = new ApplicationModel(valid);
    expect(application.validateSync()).toBeUndefined();
    expect(application.applicationStatus).toBe(
      InstructorApplicationStatus.PENDING,
    );
    expect(application.reviewedBy).toBeNull();
    expect(application.rejectionReason).toBeNull();
    expect(InstructorApplicationSchema.get('collection')).toBe(
      'instructorApplications',
    );
    expect(InstructorApplicationSchema.path('memberId').options.ref).toBe(
      'Member',
    );
    expect(
      InstructorApplicationSchema.path('instructorResortId').options.ref,
    ).toBe('Resort');
  });

  it('declares a unique index only for pending applications, preserving rejected history', () => {
    expect(InstructorApplicationSchema.indexes()).toContainEqual([
      { memberId: 1 },
      expect.objectContaining({
        name: 'unique_pending_instructor_application',
        unique: true,
        partialFilterExpression: {
          applicationStatus: InstructorApplicationStatus.PENDING,
        },
      }),
    ]);
  });

  it.each([
    ['instructorExperienceYears', -1],
    ['instructorExperienceYears', 1.5],
    ['instructorLanguages', []],
    ['instructorLanguages', [' ']],
    ['instructorAudience', 'UNKNOWN'],
    ['instructorLevel', 'MIXED'],
  ])('rejects invalid persisted application %s', (field, value) => {
    expect(
      new ApplicationModel({ ...valid, [field]: value }).validateSync()?.errors[
        field
      ],
    ).toBeDefined();
  });

  it('rejects invalid persisted Member instructor data', () => {
    const member = new MemberModel({
      memberNick: 'user',
      memberPhone: 'phone',
      memberPassword: 'hash',
      instructorExperienceYears: 0.5,
      instructorPrice1Week: -1,
      instructorPrice2Weeks: Infinity,
      instructorAudience: 'UNKNOWN',
    });
    expect(Object.keys(member.validateSync()!.errors)).toEqual(
      expect.arrayContaining([
        'instructorExperienceYears',
        'instructorPrice1Week',
        'instructorPrice2Weeks',
        'instructorAudience',
      ]),
    );
  });
});
