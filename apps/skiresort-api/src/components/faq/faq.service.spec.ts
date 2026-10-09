import 'reflect-metadata';
import { Model, Types } from 'mongoose';
import { FaqService } from './faq.service';
import { Faq } from '../../libs/dto/faq/faq';
import { Member } from '../../libs/dto/member/member';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { FaqUpdate } from '../../libs/dto/faq/faq.update';
import { FaqStatus } from '../../libs/enums/faq.enum';
import { MemberStatus, MemberType } from '../../libs/enums/member.enum';

jest.mock('uuid', () => ({
  v4: () => `image-${Math.random().toString(36).slice(2)}`,
}));
const adminId = new Types.ObjectId();
const id = new Types.ObjectId();
const query = (value: unknown) => ({
  lean: () => ({ exec: () => Promise.resolve(value) }),
});

const makeModel = (input: FaqInput) => ({
  create: jest.fn((values: Partial<Faq>) =>
    Promise.resolve({ toObject: () => values }),
  ),
  findOne: jest.fn((_filter: unknown) => {
    void _filter;
    return query({ ...input, _id: id });
  }),
  findOneAndUpdate: jest.fn(
    (_filter: unknown, _update: unknown, _options: unknown) => {
      void _filter;
      void _update;
      void _options;
      return query({ ...input, _id: id });
    },
  ),
  findOneAndDelete: jest.fn((_filter: unknown) => {
    void _filter;
    return query({ ...input, _id: id });
  }),
  aggregate: jest.fn((_pipeline: unknown[]) => {
    void _pipeline;
    return {
      exec: () => Promise.resolve([{ list: [], metaCounter: [] }]),
    };
  }),
});

describe('Faq service', () => {
  let model: ReturnType<typeof makeModel>;
  let members: { findOne: jest.Mock<ReturnType<typeof query>, [unknown]> };
  let service: FaqService;
  let input: FaqInput;
  beforeEach(() => {
    input = {
      faqQuestion: ' Faq ',
      faqAnswer: ' Description ',
    };
    model = makeModel(input);
    members = {
      findOne: jest.fn((filter: unknown) => {
        void filter;
        return query({ _id: adminId });
      }),
    };
    service = new FaqService(
      model as unknown as Model<Faq>,
      members as unknown as Model<Member>,
    );
  });
  afterEach(() => jest.restoreAllMocks());

  it('checks current admin, trims content and derives creator', async () => {
    await service.createFaq(adminId, {
      ...input,
      memberId: new Types.ObjectId(),
    } as FaqInput);
    expect(members.findOne).toHaveBeenCalledWith({
      _id: adminId,
      memberType: MemberType.ADMIN,
      memberStatus: MemberStatus.ACTIVE,
    });
    expect(model.create).toHaveBeenCalledWith(
      expect.objectContaining({
        faqQuestion: 'Faq',
        faqAnswer: 'Description',
        memberId: adminId,
      }),
    );
  });
  it.each(['create', 'update', 'remove', 'detail', 'list'])(
    'rejects stale or inactive admin for %s',
    async (operation) => {
      members.findOne.mockReturnValue(query(null));
      const requests = {
        create: () => service.createFaq(adminId, input),
        update: () =>
          service.updateFaqByAdmin(adminId, {
            _id: id.toString(),
            faqQuestion: 'edit',
          }),
        remove: () => service.removeFaqByAdmin(adminId, id.toString()),
        detail: () => service.getFaqByAdmin(adminId, id.toString()),
        list: () => service.getAllFaqsByAdmin(adminId, { page: 1, limit: 10 }),
      };
      await expect(
        requests[operation as keyof typeof requests](),
      ).rejects.toThrow('Active ADMIN');
    },
  );
  it('updates only supplied fields without resetting status or creator', async () => {
    await service.updateFaqByAdmin(adminId, {
      _id: id.toString(),
      faqQuestion: ' edit ',
      memberId: id,
    } as unknown as FaqUpdate);
    expect(model.findOneAndUpdate.mock.calls[0][1]).toEqual({
      $set: { faqQuestion: 'edit' },
    });
  });
  it('restricts public detail to published and allows admin drafts', async () => {
    await service.getFaq(id.toString());
    expect(model.findOne).toHaveBeenLastCalledWith({
      _id: id,
      faqStatus: FaqStatus.PUBLISHED,
    });
    await service.getFaqByAdmin(adminId, id.toString());
    expect(model.findOne).toHaveBeenLastCalledWith({ _id: id });
  });
  it('returns the permanently removed FAQ', async () => {
    expect(
      await service.removeFaqByAdmin(adminId, id.toString()),
    ).toMatchObject({ _id: id });
    expect(model.findOneAndDelete).toHaveBeenCalledWith({ _id: id });
  });
  it.each([
    { _id: id.toString() },
    { _id: id.toString(), faqQuestion: null },
    { _id: id.toString(), faqAnswer: ' ' },
    { _id: id.toString(), faqStatus: null },
  ])('rejects invalid updates %j', async (update) => {
    await expect(
      service.updateFaqByAdmin(adminId, update as unknown as FaqUpdate),
    ).rejects.toThrow();
    expect(model.findOneAndUpdate).not.toHaveBeenCalled();
  });
  it.each([FaqStatus.PUBLISHED, FaqStatus.DRAFT])(
    'sets publication status %s',
    async (faqStatus) => {
      await service.updateFaqByAdmin(adminId, {
        _id: id.toString(),
        faqStatus,
      });
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id },
        { $set: { faqStatus } },
        { new: true, runValidators: true },
      );
    },
  );
  it('reports missing records and invalid IDs', async () => {
    model.findOne.mockReturnValue(query(null));
    model.findOneAndDelete.mockReturnValue(query(null));
    model.findOneAndUpdate.mockReturnValue(query(null));
    await expect(service.getFaq(id.toString())).rejects.toThrow('not found');
    await expect(
      service.removeFaqByAdmin(adminId, id.toString()),
    ).rejects.toThrow('not found');
    await expect(
      service.updateFaqByAdmin(adminId, {
        _id: id.toString(),
        faqQuestion: 'edit',
      }),
    ).rejects.toThrow('not found');
    await expect(service.getFaq('invalid')).rejects.toThrow();
  });
  it('filters and paginates published FAQs', async () => {
    expect(
      await service.getFaqs({
        page: 2,
        limit: 5,
        search: { text: 'a.b' },
      }),
    ).toEqual({ list: [], metaCounter: [] });
    const pipeline = model.aggregate.mock.calls[0][0] as [
      { $match: { $or: { faqQuestion: { $regex: string } }[] } },
      unknown,
      { $facet: { list: unknown[] } },
    ];
    expect(pipeline[0].$match).toMatchObject({
      faqStatus: FaqStatus.PUBLISHED,
    });
    expect(pipeline[0].$match.$or[0].faqQuestion.$regex).toBe('a\\.b');
    expect(pipeline[1]).toEqual({ $sort: { createdAt: -1, _id: -1 } });
    expect(pipeline[2].$facet.list).toEqual([{ $skip: 5 }, { $limit: 5 }]);
  });
  it('supports admin status filters', async () => {
    await service.getAllFaqsByAdmin(adminId, {
      page: 1,
      limit: 10,
      search: { faqStatus: FaqStatus.DRAFT },
    });
    expect(model.aggregate.mock.calls[0][0][0]).toEqual({
      $match: { faqStatus: FaqStatus.DRAFT },
    });
  });
  it.each([
    { page: 0, limit: 10 },
    { page: 1, limit: 101 },
    { page: 1, limit: 0 },
    { page: 1, limit: 10, sort: 'memberPassword' },
  ])('rejects inquiry %j', async (inquiry) => {
    await expect(service.getFaqs(inquiry)).rejects.toThrow(
      'Invalid Faq inquiry',
    );
  });
});
