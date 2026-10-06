import 'reflect-metadata';
import { mkdtemp, readFile, readdir, rm, writeFile, mkdir } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { Readable } from 'stream';
import { MemberResolver } from './member.resolver';
import type { MemberService } from './member.service';
import { saveImageUpload } from '../../libs/image-upload';
import type { ImageUpload } from '../../libs/image-upload';

jest.mock('uuid', () => ({ v4: () => 'fixture-image-id' }));
jest.mock('./member.service', () => ({ MemberService: class {} }));

const upload = (overrides: Partial<ImageUpload> = {}): ImageUpload => ({
  filename: '1.jpg',
  mimetype: 'image/jpeg',
  createReadStream: () => Readable.from([Buffer.from('fixture image')]),
  ...overrides,
});

describe('Member image uploads', () => {
  let fixtureRoot: string;
  const resolver = new MemberResolver({} as MemberService);

  beforeEach(async () => {
    fixtureRoot = await mkdtemp(join(tmpdir(), 'skiresort-upload-test-'));
    jest.spyOn(process, 'cwd').mockReturnValue(fixtureRoot);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(async () => {
    jest.restoreAllMocks();
    await rm(fixtureRoot, { recursive: true, force: true });
  });

  it('creates a missing destination and returns the existing relative URL', async () => {
    const url = await resolver.imageUploader(upload(), 'article');
    expect(url).toBe('uploads/article/fixture-image-id.jpg');
    expect(await readFile(join(fixtureRoot, url), 'utf8')).toBe(
      'fixture image',
    );
  });

  it.each(['events', 'events/nested', 'EVENTS'])('reserves target %s for admin Event uploads', async (target) => {
    await expect(resolver.imageUploader(upload(), target)).rejects.toThrow('uploadEventImages');
    await expect(resolver.imagesUploader([Promise.resolve(upload())], target)).rejects.toThrow('uploadEventImages');
    expect(await readdir(fixtureRoot)).toEqual([]);
  });

  it('supports multi-upload with the same missing-directory repair', async () => {
    const urls = await resolver.imagesUploader(
      [Promise.resolve(upload())],
      'resort',
    );
    expect(urls).toEqual(['uploads/resort/fixture-image-id.jpg']);
    expect(await readFile(join(fixtureRoot, urls[0]), 'utf8')).toBe(
      'fixture image',
    );
  });

  it('propagates a real destination error rather than false', async () => {
    await writeFile(join(fixtureRoot, 'uploads'), 'blocked');
    await expect(resolver.imageUploader(upload(), 'member')).rejects.toThrow();
  });

  it('propagates source errors and removes its partial output', async () => {
    const failure = new Error('Upload stream interrupted');
    const file = upload({
      createReadStream: () =>
        Readable.from(
          (function* () {
            yield Buffer.from('partial');
            throw failure;
          })(),
        ),
    });
    await expect(resolver.imageUploader(file, 'member')).rejects.toBe(failure);
    expect(await readdir(join(fixtureRoot, 'uploads/member'))).toEqual([]);
  });

  it('does not delete or overwrite a preexisting file on destination failure', async () => {
    const directory = join(fixtureRoot, 'uploads/member');
    await mkdir(directory, { recursive: true });
    await writeFile(join(directory, 'fixture-image-id.jpg'), 'existing');
    await expect(
      resolver.imageUploader(upload(), 'member'),
    ).rejects.toMatchObject({ code: 'EEXIST' });
    expect(
      await readFile(join(directory, 'fixture-image-id.jpg'), 'utf8'),
    ).toBe('existing');
  });

  it.each(['../outside', '/absolute', 'C:\\outside', '..\\outside', ''])(
    'rejects unsafe target %j before writing',
    async (target) => {
      await expect(saveImageUpload(upload(), target)).rejects.toThrow(
        'Invalid upload target',
      );
      expect(await readdir(fixtureRoot)).toEqual([]);
    },
  );

  it.each([{ filename: '' }, { mimetype: 'text/plain' }])(
    'preserves filename and MIME validation for %j',
    async (overrides) => {
      await expect(
        resolver.imageUploader(upload(overrides), 'member'),
      ).rejects.toBeInstanceOf(Error);
      expect(await readdir(fixtureRoot)).toEqual([]);
    },
  );
});
