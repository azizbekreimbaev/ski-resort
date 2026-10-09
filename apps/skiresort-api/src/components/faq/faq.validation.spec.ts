import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { model, Types } from 'mongoose';
import FaqSchema from '../../schemas/Faq.model';
import { FaqInput, AllFaqsInquiry } from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { FaqStatus } from '../../libs/enums/faq.enum';

const FaqModel = model('FaqValidationFixture', FaqSchema);
describe('FAQ DTO and schema validation', () => {
  it('defaults schema status to DRAFT and trims content', () => {
    const faq = new FaqModel({
      faqQuestion: ' Question ',
      faqAnswer: ' Answer ',
      memberId: new Types.ObjectId(),
    });
    expect(faq.validateSync()).toBeUndefined();
    expect(faq.faqStatus).toBe(FaqStatus.DRAFT);
    expect(faq.faqQuestion).toBe('Question');
    expect(faq.faqAnswer).toBe('Answer');
    expect(FaqSchema.options.collection).toBe('faqs');
  });
  it.each(['', ' ', null, 10])(
    'rejects invalid question %j in DTO',
    (faqQuestion) => {
      expect(
        validateSync(
          plainToInstance(FaqInput, { faqQuestion, faqAnswer: 'Answer' }),
        ).length,
      ).toBeGreaterThan(0);
    },
  );
  it.each(['', ' ', null])(
    'rejects blank/null answer %j in schema',
    (faqAnswer) => {
      expect(
        new FaqModel({
          faqQuestion: 'Question',
          faqAnswer,
          memberId: new Types.ObjectId(),
        }).validateSync(),
      ).toBeDefined();
    },
  );
  it('allows omitted update fields but rejects null status and unknown statuses', () => {
    expect(
      validateSync(
        plainToInstance(FaqUpdate, {
          _id: new Types.ObjectId().toString(),
          faqAnswer: 'Answer',
        }),
      ),
    ).toEqual([]);
    for (const faqStatus of [null, 'ACTIVE']) {
      expect(
        validateSync(
          plainToInstance(FaqInput, {
            faqQuestion: 'Question',
            faqAnswer: 'Answer',
            faqStatus,
          }),
        ).length,
      ).toBeGreaterThan(0);
    }
  });
  it('validates nested admin filters', () => {
    expect(
      validateSync(
        plainToInstance(AllFaqsInquiry, {
          page: 1,
          limit: 10,
          search: { faqStatus: 'ACTIVE' },
        }),
      ).length,
    ).toBeGreaterThan(0);
  });
});
