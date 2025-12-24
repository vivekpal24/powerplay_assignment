const request = require('supertest');
const app = require('../src/app');
const eventStore = require('../src/store/eventStore');
const reservationStore = require('../src/store/reservationStore');

describe('TicketBoss API Integration Tests', () => {
    // Reset stores before each test
    // Note: Since eventStore is a singleton initialized at startup, we might need to manually reset or re-init it.
    // However, Jest might share the process. 
    // Best practice for these stores would be to have a reset method.
    // I'll assume for this test we can re-init.
    
    beforeEach(() => {
        eventStore.init('Test Event', 10);
        reservationStore.clear();
    });

    describe('GET /event', () => {
        it('should return initial event state', async () => {
            const res = await request(app).get('/event');
            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                eventId: expect.stringContaining('event-'),
                name: 'Test Event',
                totalSeats: 10,
                availableSeats: 10,
                reservationCount: 0,
                version: 1
            });
        });
    });

    describe('POST /reservations', () => {
        it('should create a reservation successfully', async () => {
            const res = await request(app)
                .post('/reservations')
                .send({ partnerId: 'A', seats: 2 });
            
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('reservationId');
            expect(res.body.seats).toBe(2);
            expect(res.body.status).toBe('confirmed');

            // Verify side effects
            const eventRes = await request(app).get('/event');
            expect(eventRes.body.availableSeats).toBe(8);
            expect(eventRes.body.reservationCount).toBe(2);
            expect(eventRes.body.version).toBe(2);
        });

        it('should fail if seats > 10', async () => {
            const res = await request(app)
                .post('/reservations')
                .send({ partnerId: 'A', seats: 11 });
            expect(res.statusCode).toBe(400); 
        });
        
        it('should fail if not enough seats', async () => {
            // Drain seats
            eventStore.reserveSeats(10);
            
            const res = await request(app)
                .post('/reservations')
                .send({ partnerId: 'B', seats: 1 });
            expect(res.statusCode).toBe(409);
        });
    });

    describe('DELETE /reservations/:id', () => {
        it('should cancel existing reservation', async () => {
            // Create one first
            const createRes = await request(app)
                .post('/reservations')
                .send({ partnerId: 'A', seats: 2 });
            const id = createRes.body.reservationId;

            const res = await request(app).delete(`/reservations/${id}`);
            expect(res.statusCode).toBe(204);

            // Verify seats returned
            const eventRes = await request(app).get('/event');
            expect(eventRes.body.availableSeats).toBe(10);
            
            // Verify status in list
            const listRes = await request(app).get('/reservations');
            const item = listRes.body.find(r => r.reservationId === id);
            expect(item.status).toBe('cancelled');
        });

        it('should return 404 for unknown reservation', async () => {
            const res = await request(app).delete('/reservations/invalid-id');
            expect(res.statusCode).toBe(404);
        });
        
        it('should return 404 for already cancelled reservation', async () => {
             // Create and cancel
            const createRes = await request(app)
                .post('/reservations')
                .send({ partnerId: 'A', seats: 2 });
            const id = createRes.body.reservationId;
            await request(app).delete(`/reservations/${id}`);
            
            // Try cancel again
            const res = await request(app).delete(`/reservations/${id}`);
            expect(res.statusCode).toBe(404);
        });
    });
    
    describe('Concurrency Check (Simulated)', () => {
         it('should handle parallel requests correctly', async () => {
             // 10 seats total. 
             // Send 5 requests of 3 seats each (Total 15 seats demanded).
             // Expect 3 to succeed (9 seats), 2 to fail (not enough for 3).
             // OR: 3 succeed (3+3+3=9), remaining 1 seat. 4th asks for 3, fails.
             
             const requests = Array(5).fill().map((_, i) => 
                 request(app).post('/reservations').send({ partnerId: `P${i}`, seats: 3 })
             );
             
             const responses = await Promise.all(requests);
             
             const created = responses.filter(r => r.statusCode === 201).length;
             const conflicts = responses.filter(r => r.statusCode === 409).length;
             
             expect(created).toBe(3); // 3 * 3 = 9 seats
             expect(conflicts).toBe(2);
             
             const eventRes = await request(app).get('/event');
             expect(eventRes.body.availableSeats).toBe(1);
         });
    });
});
