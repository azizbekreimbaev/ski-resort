import { model, Types } from 'mongoose';
import EventSchema from './Event.model';
import { EventStatus } from '../libs/enums/event.enum';

const EventModel = model('EventSchemaFixture', EventSchema);
const input = () => ({
  eventTitle: ' Title ',
  eventDesc: ' Desc ',
  eventImages: ['uploads/events/a.jpg'],
  eventStartDate: new Date('2020-01-01'),
  eventEndDate: new Date('2020-01-02'),
  memberId: new Types.ObjectId(),
});

describe('Event schema', () => {
  it('uses events collection, draft default, nullable references and trims', async () => {
    const event = new EventModel(input());
    await event.validate();
    expect(EventSchema.get('collection')).toBe('events');
    expect(event.eventStatus).toBe(EventStatus.DRAFT);
    expect(event.resortId).toBeNull();
    expect(event.eventLocation).toBeNull();
    expect(event.eventTitle).toBe('Title');
  });
  it.each([0, 6])('rejects %i images', async (count) => {
    await expect(
      new EventModel({
        ...input(),
        eventImages: Array.from(
          { length: count },
          (_, i) => `uploads/events/${i}.jpg`,
        ),
      }).validate(),
    ).rejects.toThrow();
  });
  it('rejects reversed dates', async () => {
    await expect(
      new EventModel({
        ...input(),
        eventEndDate: new Date('2019-01-01'),
      }).validate(),
    ).rejects.toThrow('after start');
  });
});
