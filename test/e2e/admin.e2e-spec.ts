import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './app.js';

describe('Admin (e2e)', () => {
  let app: NestExpressApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    ({ app } = await createTestApp());
    superAdminToken = await adminSignIn('admin@example.com', 'Adm1n!Passw0rd');
  });

  afterAll(async () => {
    await app?.close();
  });

  const http = () => request(app.getHttpServer());

  async function adminSignIn(email: string, password: string) {
    const response = await http().post('/api/admin/auth/signin').send({ email, password }).expect(200);
    return response.body.accessToken as string;
  }

  it('seeds the super admin from the environment', async () => {
    const { body } = await http()
      .get('/api/admin/auth/me')
      .set('authorization', `Bearer ${superAdminToken}`)
      .expect(200);

    expect(body).toMatchObject({ email: 'admin@example.com', role: 'SUPER_ADMIN' });
  });

  it('does not accept platform user tokens on admin routes', async () => {
    await http()
      .post('/api/v1/auth/signup')
      .send({ name: 'Mallory', email: 'mallory@example.com', password: 'S3cret!pass' })
      .expect(201);
    const { body: session } = await http()
      .post('/api/v1/auth/signin')
      .send({ email: 'mallory@example.com', password: 'S3cret!pass' })
      .expect(200);

    await http().get('/api/admin/users').set('authorization', `Bearer ${session.accessToken}`).expect(401);
    await http().get('/api/v1/auth/me').set('authorization', `Bearer ${superAdminToken}`).expect(401);
  });

  it('restricts admin management to super admins', async () => {
    await http()
      .post('/api/admin/users')
      .set('authorization', `Bearer ${superAdminToken}`)
      .send({ name: 'Ops', email: 'ops@example.com', password: '0ps!Password', role: 'ADMIN' })
      .expect(201);
    const adminToken = await adminSignIn('ops@example.com', '0ps!Password');

    await http().get('/api/admin/users').set('authorization', `Bearer ${adminToken}`).expect(403);
    const { body: admins } = await http()
      .get('/api/admin/users')
      .set('authorization', `Bearer ${superAdminToken}`)
      .expect(200);
    expect(admins.map((admin: { email: string }) => admin.email)).toContain('ops@example.com');
  });

  it('issues API keys that authenticate external systems until deactivated', async () => {
    const auth = { authorization: `Bearer ${superAdminToken}` };
    const { body: created } = await http().post('/api/admin/api-keys').set(auth).send({ name: 'ERP' }).expect(201);

    await http().get('/api/e2e/api-key-protected').expect(401);
    await http().get('/api/e2e/api-key-protected').set('x-api-key', 'sk_wrong').expect(401);
    const { body: apiKey } = await http().get('/api/e2e/api-key-protected').set('x-api-key', created.key).expect(200);
    expect(apiKey).toEqual({ id: created.id, name: 'ERP' });

    const { body: keys } = await http().get('/api/admin/api-keys').set(auth).expect(200);
    const listed = keys.find((key: { id: string }) => key.id === created.id);
    expect(listed).not.toHaveProperty('key');
    expect(listed.lastUsedAt).not.toBeNull();

    await http().post(`/api/admin/api-keys/${created.id}/deactivate`).set(auth).expect(204);
    await http().get('/api/e2e/api-key-protected').set('x-api-key', created.key).expect(401);

    await http().delete(`/api/admin/api-keys/${created.id}`).set(auth).expect(204);
    await http().delete(`/api/admin/api-keys/${created.id}`).set(auth).expect(404);
  });
});
