import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp, type FakeMailer } from './app.js';

describe('Auth (e2e)', () => {
  let app: NestExpressApplication;
  let mailer: FakeMailer;
  const credentials = { email: 'john@example.com', password: 'S3cret!pass' };

  beforeAll(async () => {
    ({ app, mailer } = await createTestApp());
    await request(app.getHttpServer())
      .post('/api/v1/auth/signup')
      .send({ name: 'John', ...credentials })
      .expect(201);
  });

  afterAll(async () => {
    await app?.close();
  });

  const http = () => request(app.getHttpServer());
  const signIn = (password = credentials.password) =>
    http().post('/api/v1/auth/signin').send({ email: credentials.email, password });

  it('reports the database as healthy', async () => {
    const response = await http().get('/api/health').expect(200);

    expect(response.body.details.database.status).toBe('up');
  });

  it('returns a consistent error body on invalid input', async () => {
    const response = await http().post('/api/v1/auth/signup').send({ email: 'nope', unknown: 1 }).expect(400);

    expect(response.body).toMatchObject({ statusCode: 400, errorCode: 'VALIDATION_ERROR' });
    expect(response.body.detail).toEqual(expect.arrayContaining([expect.objectContaining({ field: 'email' })]));
  });

  it('rejects a duplicated e-mail', async () => {
    const response = await http()
      .post('/api/v1/auth/signup')
      .send({ name: 'John', ...credentials, email: 'JOHN@example.com' })
      .expect(409);

    expect(response.body.errorCode).toBe('USER_ALREADY_EXISTS');
  });

  it('signs in and returns the authenticated user', async () => {
    const { body: session } = await signIn().expect(200);

    const { body: me } = await http()
      .get('/api/v1/auth/me')
      .set('authorization', `Bearer ${session.accessToken}`)
      .expect(200);

    expect(me).toMatchObject({ name: 'John', email: credentials.email, isVerified: false });
    expect(new Date(me.createdAt).toISOString()).toBe(me.createdAt);
  });

  it('protects authenticated routes', async () => {
    await http().get('/api/v1/auth/me').expect(401);
    await http().get('/api/v1/auth/me').set('authorization', 'Bearer not-a-jwt').expect(401);
  });

  it('rejects wrong credentials', async () => {
    const response = await signIn('Wrong!pass1').expect(401);

    expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
  });

  it('rotates refresh tokens and rejects reuse', async () => {
    const { body: session } = await signIn().expect(200);

    const { body: refreshed } = await http()
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: session.refreshToken })
      .expect(200);

    expect(refreshed.refreshToken).not.toBe(session.refreshToken);
    await http().post('/api/v1/auth/refresh').send({ refreshToken: session.refreshToken }).expect(401);

    await http().post('/api/v1/auth/signout').send({ refreshToken: refreshed.refreshToken }).expect(204);
    await http().post('/api/v1/auth/refresh').send({ refreshToken: refreshed.refreshToken }).expect(401);
  });

  it('resets the password through the token sent by e-mail', async () => {
    const { body: session } = await signIn().expect(200);

    await http().post('/api/v1/auth/forgot-password').send({ email: 'nobody@example.com' }).expect(202);
    expect(mailer.sent).toHaveLength(0);

    await http().post('/api/v1/auth/forgot-password').send({ email: credentials.email }).expect(202);
    const token = mailer.sent.at(-1)?.text.split('\n\n')[2];
    expect(token).toBeTruthy();

    await http().post('/api/v1/auth/reset-password').send({ token, newPassword: 'N3w!passw0rd' }).expect(204);
    await http().post('/api/v1/auth/reset-password').send({ token, newPassword: 'N3w!passw0rd' }).expect(400);

    // Every existing session is revoked and the new password works.
    await http().post('/api/v1/auth/refresh').send({ refreshToken: session.refreshToken }).expect(401);
    await signIn().expect(401);
    const { body: newSession } = await signIn('N3w!passw0rd').expect(200);

    await http()
      .post('/api/v1/auth/change-password')
      .set('authorization', `Bearer ${newSession.accessToken}`)
      .send({ currentPassword: 'N3w!passw0rd', newPassword: credentials.password })
      .expect(204);
    await signIn().expect(200);
  });
});
