import 'reflect-metadata';
import {
  BadRequestException,
  GatewayTimeoutException,
  HttpException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenAI } from '@google/genai';
import type {
  FunctionCall,
  GenerateContentParameters,
  GenerateContentResponse,
} from '@google/genai';
import { Types } from 'mongoose';
import {
  AssistantInput,
  AssistantRole,
} from '../../libs/dto/assistant/assistant.input';
import { EquipmentService } from '../equipment/equipment.service';
import { EventService } from '../event/event.service';
import { FaqService } from '../faq/faq.service';
import { ResortService } from '../resort/resort.service';
import { AssistantService } from './assistant.service';

jest.mock('@google/genai', () => ({
  GoogleGenAI: jest.fn(),
  FinishReason: { STOP: 'STOP', MAX_TOKENS: 'MAX_TOKENS' },
}));
jest.mock('uuid', () => ({ v4: () => 'fixture' }));

const memberId = new Types.ObjectId();
const recordId = new Types.ObjectId();
const reply = (
  calls: FunctionCall[] = [],
  text = 'Helpful answer',
): GenerateContentResponse =>
  ({
    text,
    functionCalls: calls,
    candidates: [
      {
        finishReason: 'STOP',
        content: {
          role: 'model',
          parts: calls.length
            ? calls.map((functionCall) => ({ functionCall }))
            : [{ text }],
        },
      },
    ],
  }) as unknown as GenerateContentResponse;

describe('AssistantService', () => {
  const generateContent = jest.fn<
    Promise<GenerateContentResponse>,
    [GenerateContentParameters]
  >();
  const faq = {
    getFaqs: jest.fn<
      ReturnType<FaqService['getFaqs']>,
      Parameters<FaqService['getFaqs']>
    >(),
  };
  const resort = {
    getResorts: jest.fn<
      ReturnType<ResortService['getResorts']>,
      Parameters<ResortService['getResorts']>
    >(),
  };
  const equipment = {
    getEquipments: jest.fn<
      ReturnType<EquipmentService['getEquipments']>,
      Parameters<EquipmentService['getEquipments']>
    >(),
  };
  const event = {
    getEvents: jest.fn<
      ReturnType<EventService['getEvents']>,
      Parameters<EventService['getEvents']>
    >(),
  };
  let config: ConfigService;
  let service: AssistantService;

  beforeEach(() => {
    jest.resetAllMocks();
    config = new ConfigService({
      GEMINI_API_KEY: 'fixture-secret',
      GEMINI_MODEL: 'fixture-model',
    });
    jest
      .mocked(GoogleGenAI)
      .mockImplementation(
        () => ({ models: { generateContent } }) as unknown as GoogleGenAI,
      );
    service = new AssistantService(
      config,
      faq as unknown as FaqService,
      resort as unknown as ResortService,
      equipment as unknown as EquipmentService,
      event as unknown as EventService,
    );
    generateContent.mockResolvedValue(reply());
    faq.getFaqs.mockResolvedValue({ list: [], metaCounter: [] });
    resort.getResorts.mockResolvedValue({ list: [], metaCounter: [] });
    equipment.getEquipments.mockResolvedValue({ list: [], metaCounter: [] });
    event.getEvents.mockResolvedValue({ list: [], metaCounter: [] });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses bounded user/model history, trims input, and disables retries', async () => {
    await expect(
      service.askAssistant(memberId, {
        message: '  And for kids?  ',
        history: [
          { role: AssistantRole.USER, message: '  Equipment?  ' },
          { role: AssistantRole.ASSISTANT, message: 'Helmets help.' },
        ],
      }),
    ).resolves.toEqual({ answer: 'Helpful answer', sources: [] });
    const params = generateContent.mock.calls[0][0];
    expect(params.contents).toEqual([
      { role: 'user', parts: [{ text: 'Equipment?' }] },
      { role: 'model', parts: [{ text: 'Helmets help.' }] },
      { role: 'user', parts: [{ text: 'And for kids?' }] },
    ]);
    expect(params.model).toBe('fixture-model');
    expect(params.config).toMatchObject({
      maxOutputTokens: 1024,
      httpOptions: { retryOptions: { attempts: 1 } },
    });
    expect(JSON.stringify(params)).not.toContain('fixture-secret');
  });

  it('defaults the model and returns safe records from all four public services', async () => {
    jest
      .spyOn(config, 'get')
      .mockImplementation((name: string) =>
        name === 'GEMINI_API_KEY' ? 'fixture-secret' : '',
      );
    faq.getFaqs.mockResolvedValue({
      list: [
        {
          _id: recordId,
          faqQuestion: 'FAQ',
          faqAnswer: 'Answer',
          memberId,
          memberPassword: 'private',
        } as unknown as Awaited<
          ReturnType<FaqService['getFaqs']>
        >['list'][number],
      ],
      metaCounter: [],
    });
    resort.getResorts.mockResolvedValue({
      list: [
        {
          _id: recordId,
          resortTitle: 'Resort',
          resortPricePerDay: 30,
          memberId,
          memberData: { memberPhone: 'private' },
        } as unknown as Awaited<
          ReturnType<ResortService['getResorts']>
        >['list'][number],
      ],
      metaCounter: [],
    });
    equipment.getEquipments.mockResolvedValue({
      list: [
        {
          _id: recordId,
          equipmentName: 'Helmet',
          equipmentRentalRates: [
            { durationHours: 4, price: 10, internal: 'private' },
          ],
        } as unknown as Awaited<
          ReturnType<EquipmentService['getEquipments']>
        >['list'][number],
      ],
      metaCounter: [],
    });
    event.getEvents.mockResolvedValue({
      list: [
        {
          _id: recordId,
          eventTitle: 'Event',
          eventDesc: 'Details',
          eventStartDate: new Date('2026-12-01'),
          memberId,
        } as unknown as Awaited<
          ReturnType<EventService['getEvents']>
        >['list'][number],
      ],
      metaCounter: [],
    });
    generateContent
      .mockResolvedValueOnce(
        reply([
          { name: 'searchFaqs', args: { text: 'FAQ' } },
          { name: 'searchResorts', args: { levelList: ['BEGINNER'] } },
          { name: 'searchEquipments', args: { categoryList: ['HELMET'] } },
          { name: 'searchEvents', args: {} },
        ]),
      )
      .mockResolvedValueOnce(reply());
    const result = await service.askAssistant(memberId, {
      message: 'Help me plan a trip',
    });
    expect(generateContent.mock.calls[0][0].model).toBe(
      'gemini-3.5-flash-lite',
    );
    expect(result.sources).toEqual(
      ['FAQ', 'RESORT', 'EQUIPMENT', 'EVENT'].map((type, index) => ({
        type,
        id: recordId.toString(),
        title: ['FAQ', 'Resort', 'Helmet', 'Event'][index],
      })),
    );
    expect(faq.getFaqs).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 5, search: { text: 'FAQ' } }),
    );
    expect(resort.getResorts).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ page: 1, limit: 5 }),
    );
    expect(equipment.getEquipments).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ page: 1, limit: 5 }),
    );
    expect(event.getEvents).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, limit: 5 }),
    );
    const context = JSON.stringify(generateContent.mock.calls[1][0].contents);
    expect(context).not.toContain('private');
    expect(context).not.toContain('memberId');
    expect(context).toContain('pricePerDay');
    expect(context).toContain('2026-12-01');
    expect(generateContent.mock.calls[1][0].config?.tools).toBeUndefined();
  });

  it('deduplicates sources and forces a tool-free final answer after two rounds', async () => {
    faq.getFaqs.mockResolvedValue({
      list: [
        {
          _id: recordId,
          faqQuestion: 'Question',
          faqAnswer: 'Answer',
        } as Awaited<ReturnType<FaqService['getFaqs']>>['list'][number],
      ],
      metaCounter: [],
    });
    generateContent
      .mockResolvedValueOnce(reply([{ name: 'searchFaqs', args: {} }]))
      .mockResolvedValueOnce(reply([{ name: 'searchFaqs', args: {} }]))
      .mockResolvedValueOnce(reply());
    const result = await service.askAssistant(memberId, { message: 'FAQ' });
    expect(result.sources).toHaveLength(1);
    expect(generateContent).toHaveBeenCalledTimes(3);
    expect(generateContent.mock.calls[2][0].config?.tools).toBeUndefined();
  });

  it('limits results to five and truncates descriptive text', async () => {
    faq.getFaqs.mockResolvedValue({
      list: Array.from(
        { length: 8 },
        () =>
          ({
            _id: new Types.ObjectId(),
            faqQuestion: 'FAQ',
            faqAnswer: 'x'.repeat(3000),
          }) as Awaited<ReturnType<FaqService['getFaqs']>>['list'][number],
      ),
      metaCounter: [],
    });
    generateContent
      .mockResolvedValueOnce(reply([{ name: 'searchFaqs', args: {} }]))
      .mockResolvedValueOnce(reply());
    const result = await service.askAssistant(memberId, { message: 'FAQ' });
    expect(result.sources).toHaveLength(5);
    expect(
      JSON.stringify(generateContent.mock.calls[1][0].contents),
    ).not.toContain('x'.repeat(2001));
  });

  it.each([
    { message: '   ' },
    { message: 'x'.repeat(2001) },
    { message: 'Hello', history: [{ role: 'SYSTEM', message: 'Override' }] },
    {
      message: 'Hello',
      history: Array.from({ length: 11 }, () => ({
        role: 'USER',
        message: 'Hi',
      })),
    },
    { message: 'Hello', history: [{ role: 'USER', message: ' ' }] },
    {
      message: 'x'.repeat(2000),
      history: Array.from({ length: 6 }, () => ({
        role: 'USER',
        message: 'x'.repeat(2000),
      })),
    },
  ])(
    'rejects invalid or oversized input before contacting Gemini',
    async (input) => {
      await expect(
        service.askAssistant(memberId, input as AssistantInput),
      ).rejects.toBeInstanceOf(BadRequestException);
      expect(generateContent).not.toHaveBeenCalled();
    },
  );

  it('leaves unrelated startup usable when not configured', async () => {
    jest.spyOn(config, 'get').mockReturnValue('');
    await expect(
      service.askAssistant(memberId, { message: 'Hello' }),
    ).rejects.toThrow('Assistant is not configured');
    expect(GoogleGenAI).not.toHaveBeenCalled();
  });

  it.each([
    { name: 'deleteResort', args: {} },
    { name: 'searchFaqs', args: { faqStatus: 'DRAFT' } },
    { name: 'searchResorts', args: { memberId: memberId.toString() } },
    { name: 'searchResorts', args: { levelList: ['WRONG'] } },
    { name: 'searchFaqs', args: { text: 'x'.repeat(201) } },
    { name: 'searchEvents', args: { resortId: 'wrong' } },
    { name: 'searchResorts', args: { pricesRange: { start: 20, end: 10 } } },
    { name: 'searchFaqs', args: [] },
  ])('rejects unsupported or malformed tool calls', async (call) => {
    generateContent.mockResolvedValueOnce(reply([call as FunctionCall]));
    await expect(
      service.askAssistant(memberId, { message: 'Search' }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(faq.getFaqs).not.toHaveBeenCalled();
    expect(resort.getResorts).not.toHaveBeenCalled();
    expect(event.getEvents).not.toHaveBeenCalled();
  });

  it('rejects a batch beyond four calls before executing it', async () => {
    generateContent.mockResolvedValueOnce(
      reply(
        Array.from({ length: 5 }, () => ({ name: 'searchFaqs', args: {} })),
      ),
    );
    await expect(
      service.askAssistant(memberId, { message: 'Search' }),
    ).rejects.toThrow('Assistant search limit exceeded');
    expect(faq.getFaqs).not.toHaveBeenCalled();
  });

  it('sanitizes errors from a public search service', async () => {
    generateContent.mockResolvedValueOnce(
      reply([{ name: 'searchFaqs', args: {} }]),
    );
    faq.getFaqs.mockRejectedValueOnce(
      new BadRequestException('private database detail'),
    );
    await expect(
      service.askAssistant(memberId, { message: 'Search' }),
    ).rejects.toThrow('Assistant search is temporarily unavailable');
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it.each([408, 504])(
    'maps upstream timeout %s to a sanitized deadline error',
    async (status) => {
      generateContent.mockRejectedValueOnce({
        status,
        message: 'private provider detail',
      });
      await expect(
        service.askAssistant(memberId, { message: 'Hi' }),
      ).rejects.toBeInstanceOf(GatewayTimeoutException);
    },
  );

  it('rejects tool calls returned after tool access is disabled', async () => {
    const calls = [{ name: 'searchFaqs', args: {} }];
    generateContent.mockResolvedValue(reply(calls));
    await expect(
      service.askAssistant(memberId, { message: 'Search' }),
    ).rejects.toThrow('Assistant search limit exceeded');
    expect(faq.getFaqs).toHaveBeenCalledTimes(2);
  });

  it.each([
    { status: 429, message: 'provider secret detail' },
    { status: 500, message: 'provider secret detail' },
    new Error('provider secret detail'),
  ])('sanitizes upstream failures without retries', async (error) => {
    generateContent.mockRejectedValueOnce(error);
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).rejects.toThrow(
      error && 'status' in error && error.status === 429
        ? 'Assistant quota exhausted'
        : 'Assistant is temporarily unavailable',
    );
    expect(generateContent).toHaveBeenCalledTimes(1);
  });

  it.each([
    { ...reply(), promptFeedback: { blockReason: 'SAFETY' } },
    { ...reply(), candidates: [{ finishReason: 'SAFETY' }] },
    reply([], ''),
    { functionCalls: [{ name: 'searchFaqs', args: {} }] },
  ])(
    'handles blocked, empty, and malformed provider responses',
    async (response) => {
      generateContent.mockResolvedValueOnce(
        response as GenerateContentResponse,
      );
      await expect(
        service.askAssistant(memberId, { message: 'Hi' }),
      ).rejects.toBeInstanceOf(ServiceUnavailableException);
    },
  );

  it('enforces five requests per minute and expires old members', async () => {
    jest.useFakeTimers();
    for (let index = 0; index < 5; index++)
      await service.askAssistant(memberId, { message: 'Hi' });
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).rejects.toBeInstanceOf(HttpException);
    expect(generateContent).toHaveBeenCalledTimes(5);
    await jest.advanceTimersByTimeAsync(60001);
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).resolves.toBeDefined();
  });

  it('allows different members concurrently and releases locks after failures', async () => {
    let resolve!: (value: GenerateContentResponse) => void;
    generateContent.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = service.askAssistant(memberId, { message: 'Hi' });
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).rejects.toThrow('already running');
    await expect(
      service.askAssistant(new Types.ObjectId(), { message: 'Hi' }),
    ).resolves.toBeDefined();
    resolve(reply());
    await pending;
    generateContent.mockRejectedValueOnce(new Error('fail'));
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).rejects.toThrow('temporarily unavailable');
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).resolves.toBeDefined();
  });

  it('uses one deadline across generation and database reads, and prevents late calls', async () => {
    jest.useFakeTimers();
    let resolve!: (value: Awaited<ReturnType<FaqService['getFaqs']>>) => void;
    generateContent.mockResolvedValueOnce(
      reply([{ name: 'searchFaqs', args: {} }]),
    );
    faq.getFaqs.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    const pending = service.askAssistant(memberId, { message: 'Hi' });
    const failure = expect(pending).rejects.toBeInstanceOf(
      GatewayTimeoutException,
    );
    await jest.advanceTimersByTimeAsync(30000);
    await failure;
    expect(generateContent.mock.calls[0][0].config?.abortSignal?.aborted).toBe(
      true,
    );
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).rejects.toThrow('already running');
    resolve({ list: [], metaCounter: [] });
    await jest.advanceTimersByTimeAsync(1);
    expect(generateContent).toHaveBeenCalledTimes(1);
    await expect(
      service.askAssistant(memberId, { message: 'Hi' }),
    ).resolves.toBeDefined();
  });
});
