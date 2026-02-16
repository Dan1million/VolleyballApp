-- Seed data for the Volleyball App
-- Run after schema.sql

USE volleyball_app;

-- Insert sample locations
INSERT INTO locations (name, address, city, state, zip_code, latitude, longitude) VALUES
('Venice Beach Volleyball Courts', '1800 Ocean Front Walk', 'Los Angeles', 'CA', '90291', 33.9850, -118.4695),
('Manhattan Beach Volleyball', '1 Manhattan Beach Blvd', 'Manhattan Beach', 'CA', '90266', 33.8847, -118.4109),
('Hermosa Beach Courts', '1 Pier Ave', 'Hermosa Beach', 'CA', '90254', 33.8622, -118.3995),
('Santa Monica Beach', '2600 Ocean Park Blvd', 'Santa Monica', 'CA', '90405', 34.0025, -118.4900),
('Huntington Beach Central Park', '18100 Goldenwest St', 'Huntington Beach', 'CA', '92648', 33.7175, -117.9981),
('Balboa Park Volleyball', '1549 El Prado', 'San Diego', 'CA', '92101', 32.7341, -117.1441);

-- Insert sample courts for each location
INSERT INTO courts (location_id, name, court_type, is_indoor, surface_type) VALUES
(1, 'Court 1 - South', 'beach', 0, 'sand'),
(1, 'Court 2 - North', 'beach', 0, 'sand'),
(1, 'Court 3 - Center', 'beach', 0, 'sand'),
(2, 'Main Court', 'beach', 0, 'sand'),
(2, 'Tournament Court', 'beach', 0, 'sand'),
(3, 'Court A', 'beach', 0, 'sand'),
(3, 'Court B', 'beach', 0, 'sand'),
(4, 'SM Court 1', 'beach', 0, 'sand'),
(4, 'SM Court 2', 'beach', 0, 'sand'),
(5, 'Grass Court 1', 'outdoor', 0, 'grass'),
(5, 'Grass Court 2', 'outdoor', 0, 'grass'),
(6, 'Indoor Court 1', 'indoor', 1, 'hardwood'),
(6, 'Indoor Court 2', 'indoor', 1, 'hardwood');

-- Insert a demo user (password: "password123")
-- bcrypt hash for "password123" with 12 rounds
INSERT INTO users (email, password_hash, first_name, last_name, date_of_birth) VALUES
('demo@volleyball.app', '$2a$12$LJ3m4ys3Lk.jIe8WO8S9E.5Y4bqKbHfCgZJ7V8HpUjXzKR6Q/XMWS', 'Demo', 'User', '1995-06-15');

-- Insert sample events (future dates)
INSERT INTO events (creator_id, court_id, title, description, event_date, max_players, skill_level) VALUES
(1, 1, 'Saturday Morning Pickup', 'Casual pickup game. All levels welcome! Bring water.', DATE_ADD(NOW(), INTERVAL 3 DAY), 12, 'all'),
(1, 4, 'Competitive Doubles', 'Looking for competitive doubles players. Intermediate+ level.', DATE_ADD(NOW(), INTERVAL 5 DAY), 8, 'intermediate'),
(1, 6, 'Beach Volleyball Beginners', 'New to volleyball? Come learn the basics in a friendly environment.', DATE_ADD(NOW(), INTERVAL 7 DAY), 16, 'beginner'),
(1, 10, 'Grass Volleyball Tournament', 'Mini grass volleyball tournament. Teams of 4.', DATE_ADD(NOW(), INTERVAL 10 DAY), 24, 'all'),
(1, 12, 'Indoor League Night', 'Weekly indoor volleyball league game. Advanced players preferred.', DATE_ADD(NOW(), INTERVAL 2 DAY), 12, 'advanced');

-- Sign up demo user for their own events
INSERT INTO event_signups (event_id, user_id) VALUES
(1, 1),
(2, 1),
(3, 1),
(4, 1),
(5, 1);
