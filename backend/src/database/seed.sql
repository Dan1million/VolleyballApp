-- Seed data for the Volleyball App
-- Run after schema.sql

USE volleyball_app;

-- Insert sample locations
INSERT INTO locations (name, address, city, state, zip_code, latitude, longitude) VALUES
('Fort Boise Community Center', '700 Robbins Rd', 'Boise', 'ID', '83702', 43.6163983, -116.19029546),
('Meridian Homecourt', '936 Taylor Ave', 'Meridian', 'ID', '83642', 43.60785533, -116.403895307),
('Treasure Valley Athletic Center', '1251 E Piper Ct', 'Meridian', 'ID', '83642', 43.60381, -116.37894267),
('Rise Volleyball Academy', '719 N Principle Pl #110', 'Meridian', 'ID', '83642', 43.61147278, -116.34607668),
('Ann Morrison Park', '1130 W Royal Blvd', 'Boise', 'ID', '83706', 43.6111145, -116.214927),
('Boise State Beach Courts', '1104 S Oakland Ave', 'Boise', 'ID', '83706', 43.599375, -116.2025213),
('Camels Back Park', '1200 Heron St', 'Boise', 'ID', '83702', 43.634227, -116.201709);

-- Insert sample courts for each location
INSERT INTO courts (location_id, name, court_type, is_indoor, surface_type) VALUES
(1, 'Court 1', 'indoor', 1, 'hardwood'),
(1, 'Court 2', 'indoor', 1, 'hardwood'),
(2, 'Court 1', 'indoor', 1, 'hardwood'),
(2, 'Court 2', 'indoor', 1, 'hardwood'),
(3, 'Main Court', 'indoor', 1, 'hardwood'),
(4, 'Court 1', 'indoor', 1, 'hardwood'),
(4, 'Court 2', 'indoor', 1, 'hardwood'),
(4, 'Court 3', 'indoor', 1, 'hardwood'),
(5, 'Beach Court', 'beach', 0, 'sand'),
(5, 'Grass Court Near Beach Court', 'outdoor', 0, 'grass'),
(5, 'Grass Court Across River', 'outdoor', 0, 'grass'),
(6, 'Beach Court 1', 'beach', 0, 'sand'),
(6, 'Beach Court 2', 'beach', 0, 'sand'),
(6, 'Beach Court 3', 'beach', 0, 'sand'),
(7, 'Beach Court', 'beach', 0, 'sand'),
(7, 'Grass Court', 'outdoor', 0, 'grass');
